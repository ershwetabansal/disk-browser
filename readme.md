## Disk browser
This package supports the client implementation for browsing files and directories on a disk.

Disk browser helps in managing files and directories on a disk.
Disk can be a folder maintained on the server or AWS disk or any other shared disks
which can be connected through some APIs.

The client component is written in javascript. Server component is currently 
available in Laravel PHP and node js. Server component can easily be developed
in other languages as well.

The application has been written with TDD approach.

Steps to configure -

1. Use npm or bower to install
npm install disk-browser --save
bower install disk-browser --save

2. Using gulp or grunt task runner, you can copy node_modules/diskbrowser/dist or
 bower_components/diskbrowser/dist folder to the public directory.

3. Clone, fork or download the server component of disk browser.

4. Merge the code with your server component.
