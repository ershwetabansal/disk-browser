# Disk browser
Disk browser is a client-side dependency for managing files and directories on a storage disk e.g AWS 
or any other shared disk.

The client component is written in javascript. Server component is currently 
available in Laravel PHP and node js. Server component can easily be developed
in other languages as well.

### Demo
https://disk-browser.herokuapp.com/demo


### Configuring this package
* Use npm or bower to install

```
   npm install disk-browser --save
```
```
   bower install disk-browser --save
```

* Using gulp or grunt task runner, you can copy `node_modules/diskbrowser/dist` or
 `bower_components/diskbrowser/dist` folder to the `public` directory of your application.

* Clone, fork or download the server component of disk browser. 

   Git repo for node js -
   
   https://github.com/ershwetabansal/disk-browser-nodejs

   Git repo for Laravel PHP -
   
   https://github.com/ershwetabansal/disk-browser-laravel

* For more details on the configuration, please refer docs -

   https://disk-browser.herokuapp.com/docs

### Build/modify this package
* Fork this repository

* Install all dependencies
```$xslt
npm install
```

* Build files
```$xslt
gulp
```
* Run tests
```$xslt
npm test
```

* Run tests with watchers
```$xslt
npm run test_watch
```


