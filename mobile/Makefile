.PHONY: install start android ios web build-apk lint test clean

install:
	npm install

start:
	npx expo start

android:
	npx expo start --android

ios:
	npx expo start --ios

web:
	npx expo start --web

build-apk:
	npx eas build --platform android --profile preview

lint:
	npm run lint

test:
	npm test

clean:
	rm -rf .expo dist node_modules
