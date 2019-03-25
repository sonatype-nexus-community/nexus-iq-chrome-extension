# Purpose
To evaluate a package against the IQ server. Can analyse packages in Maven, NPM, Nuget, PyPI and RubyGems.

# Versions
## 1.05 - 2018-06-04 - Latest release
  * Fix error handling
  * Added lightbulb to popup when an issue

## 1.04 - 2018-06-03
  * Handles missing backslash on end of base URL in settings i.e. http://localhost:8070 or http://localhost:8070/

## 1.03 - 2018-06-03
  * Fix refresh bug where you had to click refresh on a page to evaluate. Now when you navigate to a matching page it will automatically evaluate.
  * URL matching link to package folder and not just root of site.

## 1.02 - 2018-06-02
  * Added support for storing server end point in the options page.

## 1.01 - 2018-06-02
  * Added proxy params for nginx server.
  * Added support for parsing the HTML of the latest and determining the version not in the URL.

## 1.00 - 2018-06-02
  * Initial release, can evaluate a package against the IQ Server with a GUI response

## 0.01 - 2018-05-30
  * Pre release, can evaluate a package against the IQ Server with an alert box


# Caveats
* Tested in Google Chrome Version 66.0.3359.181 (Official Build) (64-bit) only!!!
* Tested in Chrome Developer mode only !!!!
* Works on my machine :)
* A bit more polished now. It has a GUI for the results and will run as soon as you click on the Blue Lightbulb

* 2018-06-03 Status - Version 1.0.2 Built. Fixes - now reads and writes to the options page correctly. 
** There is still a small bug at the moment where the Jquery parser is not firing on the page at the right time.  This means that you have to refresh the page and then click on the blue light bulb again. Next ID I will try to fix this. There is something wrong with the event that I am injecting into.

* 2018-06-02 Status - There is a small bug at the moment where the Jquery parser is not firing on the page at the right time.  This means that you have to refresh the page and then click on the blue light bulb again. Next ID I will try to fix this. There is something wrong with the event that I am injecting into.


# Setup
1. Grab a cup of coffee this may take some time.
2. install nginx and add the included nexusiq.conf and proxy_params - this exposes localhost:8011 and adds headers and a new endpoint that handles OPTIONS request that nexus IQ does not have and that Chrome Extensions use to call ajax end points. This is CORS/SOP and affects this plugin. There may be a simpler fix of which I am not aware. Happy to get feedback on this.
3. Add the folder NexusIQChromeExtension to the Chrome "Load Unpacked extension"
4. You will get a light bulb in the toolbar - disabled by default


# Usage
1. Browse to one of the package managers listed below the IQ lightbulb will light up.
2. Click on the light bulb, and your results will appear.
3. The results has three tabs -1) Component Info, -2) Licensing and -3) Security
4. The Licensing tab, License ID will be a link to the Wikipedia article. Feature request is to link to the langugae specific text for each, i.e. in Germany to link to the DE page in wikipedia or better yet the license itself. 
5. The Security tab uses an accordion to list all Security violations for the component. e.g. Django 1.6 has 40

# Sites/Pages currently supported
## Maven
Tool works with the specific version page only at this stage. 
https://search.maven.org/#artifactdetails%7C[group]%7C[artifact]%7C[version]%7C[extension] e.g.   https://search.maven.org/#artifactdetails%7Ccommons-collections%7Ccommons-collections%7C3.2.1%7Cjar

## NPM
Tool works with the specific version page and also the default package page. It uses Jquery to parse the page to get the latest version.
https://www.npmjs.com/package/[package] e.g. https://www.npmjs.com/package/lodash
and
https://www.npmjs.com/package/[package]/v/[version] e.g. https://www.npmjs.com/package/lodash/v/4.4.0

## Nuget
Tool works with the specific version page and also the default package page. It uses Jquery to parse the page to get the latest version. i.e. 

https://www.nuget.org/packages/[package] e.g. https://www.nuget.org/packages/LibGit2Sharp
and
https://www.nuget.org/packages/[package]/[version] e.g. https://www.nuget.org/packages/LibGit2Sharp/0.1.0


## PyPi
Tool works with the specific version page and also the default package page. It uses Jquery to parse the page to get the latest version. i.e. 
https://pypi.org/project/[package]/ e.g. https://pypi.org/project/Django/
and
https://pypi.org/project/[package]/[version]/ e.g. https://pypi.org/project/Django/1.6/


## RubyGems
Tool works with the specific version page and also the default package page. It uses Jquery to parse the page to get the latest version. i.e. 
https://rubygems.org/gems/[package]/versions e.g. https://rubygems.org/gems/bundler/versions
and
https://rubygems.org/gems/[package]/versions/[version] e.g. https://rubygems.org/gems/bundler/versions/1.16.1


# TODO
1. ~~Make option settings work so that you can set your IQ Server address. Currently hardcoded in the app~~
2. ~~Username and password not hardcoded~~
3. ~~GUI front end on top of response - done~~
4. ~~Single click to evaluate - done~~
5. Refactor the code to remove deadends and false starts.- partially cleaned up
6. Tidy up the GUI. CSS and HTML looks a bit lame at the moment. Next ID.
7. ~~Fix bug where Jquery is not always being injected in to the page to parse the version info.~~
8. Better error handling
9. Unit tests
10. Publish to Exchange?
11. Password is stored in options as plain text - limitation of Chrome
12. Use fetch instead of $.ajax - which is deprecated