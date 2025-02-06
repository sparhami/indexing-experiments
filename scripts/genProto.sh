protoc \
    --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
    --ts_opt=esModuleInterop=true \
    --js_out=import_style=commonjs,binary:./src/generated \
    --ts_out=./src/generated \
    proto/*