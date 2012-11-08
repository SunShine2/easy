@echo on
for %%a in (%~dp0) do (
  %%~da
)
cd %~dp0
phantomjs commit.js %1 %2 %3