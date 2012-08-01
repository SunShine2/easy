//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

// The following code is heavily inspired by jQuery's $.fn.data()

;(function($) {
  var data = {}, dataAttr = $.fn.data, camelize = $.zepto.camelize,
    exp = $.expando = 'Zepto' + (+new Date())

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  /**
   * 从data存储中获取属性值
   * @param node
   * @param name
   */
  function getData(node, name) {
    //获取节点的expando值，如果id存在，则从data中取出数据
    var id = node[exp], store = id && data[id]
    //如果没有指定name属性，则直接返回store
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
        //如果store中含有对应的name，则返回值
        if (name in store) return store[name]
        //将‘-’连接符形式的字符串转换成驼峰形式
        var camelName = camelize(name)
        //再次获取
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  // 存储节点属性值，并标注节点
  function setData(node, name, value) {
    //如果没有uuid则添加
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node))
    //以驼峰式命名存储
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  // 读取节点的所有data属性
  function attributeData(node) {
    var store = {}
    $.each(node.attributes, function(i, attr){
      //取出所有属性并存入store
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] = attr.value
    })
    return store
  }

  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
      // 如果name是对象字面量，则将数据写入缓存
      $.isPlainObject(name) ?
        this.each(function(i, node){
          $.each(name, function(key, value){ setData(node, key, value) })
        }) :
        // get value from first element
        // 如果不是对象字面量并且节点列表length不为0，则对第一个节点获取name对应的属性值
        this.length == 0 ? undefined : getData(this[0], name) :
      // set value on all elements
      // 对所有节点进行属性设置
      this.each(function(){ setData(this, name, value) })
  }

  /**
   * 删除节点列表中对应name的值
   * @param names
   */
  $.fn.removeData = function(names) {
    if (typeof names == 'string') names = names.split(/\s+/)
    return this.each(function(){
      var id = this[exp], store = id && data[id]
      if (store) $.each(names, function(){ delete store[camelize(this)] })
    })
  }
})(Zepto)
