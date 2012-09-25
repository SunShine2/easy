@echo on
cd %~dp0
cd ../target
%~dp0zip.exe -r %1.zip %1