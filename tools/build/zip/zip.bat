@echo on

for %%a in (%2) do (
  %%~da
)
cd %2
%~dp0zip.exe -r %1.zip %1