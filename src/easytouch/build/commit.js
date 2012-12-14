/*!
 * @copyright www.aliyun.com
 * @author zhengxie.lj@alibaba-inc.com
 * @update 2012-06-28
 * @description 用于快速提交zip包到云应用管理后台
 * @hosts 10.249.214.17   admin.cloudapp.aliyun.com
 * @example
 * <pre>
 * phantomjs commit.js market.zip 921
 * </pre>
 */

var debuger = true;
var server = 'http://admin.cloudapp.aliyun.com';
if(debuger){
    server = 'http://test.developer.aliyun.com/console';
}

var system = require("system"),
    fs = require("fs"),
	page = require("webpage").create(),
	url,
	testindex = 0, 
	filename,
	id,
	username,
        version,
	password,
	loadInProgress = false;



filename = system.args[1];
id = system.args[2];
version = system.args[3];
if(!filename || !id || !(/.+\.zip$/i.test(filename))){
	console.log('the first argv must be a zip file, and the second is cloudapp id.');
	phantom.exit();
}else if(isNaN(Number(id))){
	console.log("cloudapp id must be a digit");
	phantom.exit();
}else if(!fs.exists(filename)){
	console.log("zip file " + filename + " not found");
	phantom.exit();
}else{
	console.log("zip file is: "+ filename);
	console.log("cloudapp id is: "+ id);
}

//从配置文件读取username和password
;(function(){
	var content;
	
	try{
		content = fs.read("commit.json");
	}catch(err){
		console.log("read commit.json fail");
		phantom.exit();
	}
	try{
		content = JSON.parse(content);
	}catch(err){
		console.log("parse commit.json fail");
		phantom.exit();
	}
	username = content.username;
	password = content.password;
})();

page.settings.userAgent = "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.162 Safari/535.19"
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.onLoadStarted = function() {
    loadInProgress = true;
   // console.log("-----------------------------load started");
};


page.onLoadFinished = function() {
    loadInProgress = false;
   // console.log("-----------------------------load finished");
};



var steps = [
function(){
	console.log("login...");
	page.open(server+"/manage/manage.php");
    page.injectJs('jquery.min.js');
},
function () {
	page.evaluate(function(username, password){
		if($("#signin_username").length){
			$("#signin_username").val(username);
			$("#signin_password").val(password);
			document.createElement('form').submit.call($("form").get(0));
		}
	}, username, password);
},
function(){
	console.log("search app...");
	page.open(server+"/manage/manage.php/app?app_id=" + id + "&name=&category=&newapp=&status=&admin=&tyuid=&system=")
},
function(){
	var result = page.evaluate(function() {
		window.confirm = function(){
			return true;
		}
		
		if($("#signin_username").length){
			console.log("login failure");
			return "exit";
		}
		var td = $("#form1 tbody tr td:eq(8)");
		if(td.length == 0){
			console.log("the cloudapp which id is" + id + " not found");
			return "exit";
		}

		var anchor = td.find("a");
		if(anchor.length == 0){
			console.log("current status: " + td.html().trim());
		}else if(anchor.length == 1){
			console.log("cancal the old package...");
			anchor.click();
		}
	});
	if(result == "exit"){
		phantom.exit();
	}
},
function(){
	console.log("edit...");
	page.open(server+"/manage/manage.php/app/edit/id/" + id)
},
function(){
    if(!version){
        return;
    }
    page.evaluate(function(version) {
        if($("#dev_app_version_versionname").length){
            $("#dev_app_version_versionname").val(version);
        }
    }, version);
},
function(){
	page.uploadFile('input[id=dev_app_version_package]', filename);
	page.evaluate(function() {
		$(".sf_admin_actions input:eq(0)").click();
	});
},
function(){
	console.log("upload zip...");
	var result = page.evaluate(function() {
		var errors = $(".sf_admin_form .error_list li");
		if(errors.length > 0){
			$.each(errors, function(index, item){
				console.log($(item).html());
			});
			return "exit";
		}
	});
	if(result == "exit"){
		phantom.exit();
	}
},
function(){
    console.log("edit launch page...");
    page.open(server+"/manage/manage.php/app/edit/id/" + id);
},
function(){
    page.evaluate(function() {
        var select = $("#dev_app_version_launchurl"),
            options = select.find("option");
        options.each(function(index, item){
            if(/index\.html/i.test(item.getAttribute('value'))){
                item.setAttribute('selected', 'selected');
                select.value = item.getAttribute('value');
            }else{
                item.removeAttribute('selected');
            }
            $(item).blur();
        });

        $(".sf_admin_actions input:eq(0)").click();
    });
},
function(){
    console.log("check launch page...");
    var result = page.evaluate(function() {
        var errors = $(".sf_admin_form .error_list li");
        if(errors.length > 0){
            $.each(errors, function(index, item){
                console.log($(item).html());
            });
            return "exit";
        }
    });
    if(result == "exit"){
        phantom.exit();
    }
},
function(){
	page.open(server+"/manage/manage.php/app/publish/id/" + id);
},
function(){
	page.evaluate(function() {
		window.confirm = function(){
			return true;
		}
		$(".sf_admin_form .submit input:eq(0)").click();
	});
},
function(){
	console.log("publish...");
},
function(){
	page.open(server+"/manage/manage.php/app/edit/id/" + id);
},
function(){
	var result = page.evaluate(function(){
		var anchor = $(".sf_admin_form .sf_admin_actions a");
		if(anchor.length && anchor.html().trim() == "申请发布"){
			 console.log("success");
		}else{
			 console.log("failure");
		}
		return "exit";
	});

	if(result == "exit"){
		phantom.exit();
	}
}
]



var interval = setInterval(function() {
    if (!loadInProgress && typeof steps[testindex] == "function")
    {
      //  console.log("step " + (testindex + 1));
        steps[testindex]();
        testindex++;
    }
    if (typeof steps[testindex] != "function")
    {
        console.log("commit completed!");
        phantom.exit();
    }
}, 50);