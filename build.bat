
call npm run build
rmdir /S /Q build
mkdir build
cd build
mkdir app
mkdir qode
cd ..
copy .\dist\* .\build\app\
copy .\assets\qode\* .\build\qode\
copy .\assets\*.bat .\build\