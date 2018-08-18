# Debug VSTS Extension (workitem / web access) #
1. open fiddler
2. select the "AutoResponse" tab
3. mark "Enable rules" and "Unmatched requests passthrough"
4. add Rule
    Rule: "regex:https://{Publisher Name}.gallery.vsassets.io/_apis/public/gallery/publisher/{Publisher Name}/extension/{Extension Id}-dev/0.1.+/privateasset/.+/scripts/.+.js"    
    
    Value: "*header:CachControl=no-cache"
5. add the following rule as many JS file you have and wish to debug
    Rule: "regex:https://{Publisher Name}.gallery.vsassets.io/_apis/public/gallery/publisher/{Publisher Name}/extension/{Extension Id}-dev/0.1.+/privateasset/.+/scripts/{filename}.js"
    
    Value: "{local file full path}" 
    (ex. C:\GitRepos\WitWebControls\WebAccess\scripts\app.js)

this can also apply to any other type of file like:
- html
- css
- etc...

Extension Id - found in the manifest under "id"
Publisher Name - found in the manifest under "publisher"

## Referance: ##
1. [http://www.alexandervanwynsberghe.be/debugging-tfs-web-access-customizations/](http://www.alexandervanwynsberghe.be/debugging-tfs-web-access-customizations/)

## Example ##
1. r1
    * regex:https://lirandobrish.gallery.vsassets.io/_apis/public/gallery/publisher/lirandobrish/extension/sdwitextensions-dev/0.1.+/privateasset/.+/scripts/.+.js
    * "*header:CachControl=no-cache"
2. r2
    * regex:https://lirandobrish.gallery.vsassets.io/_apis/public/gallery/publisher/lirandobrish/extension/sdwitextensions-dev/0.1.+/privateasset/.+/scripts/app.js
    * C:\GitRepos\WitWebControls\WebAccess\scripts\app.js
3. r3 
    * regex:https://lirandobrish.gallery.vsassets.io/_apis/public/gallery/publisher/lirandobrish/extension/sdwitextensions-dev/0.1.+/privateasset/.+/scripts/CompareDialog.js
    * C:\GitRepos\WitWebControls\WebAccess\scripts\CompareDialog.js
4. r4
    * regex:https://lirandobrish.gallery.vsassets.io/_apis/public/gallery/publisher/lirandobrish/extension/sdwitextensions-dev/0.1.+/privateasset/.+/scripts/errorview.js
    * C:\GitRepos\WitWebControls\WebAccess\scripts\errorview.js
5. r5
    * regex:https://lirandobrish.gallery.vsassets.io/_apis/public/gallery/publisher/lirandobrish/extension/sdwitextensions-dev/0.1.+/privateasset/.+/scripts/model.js
    * C:\GitRepos\WitWebControls\WebAccess\scripts\model.js
6. r6
    * regex:https://lirandobrish.gallery.vsassets.io/_apis/public/gallery/publisher/lirandobrish/extension/sdwitextensions-dev/0.1.+/privateasset/.+/scripts/TCStepsVersionControl.js
    * C:\GitRepos\WitWebControls\WebAccess\scripts\TCStepsVersionControl.js
7. r7
    * regex:https://lirandobrish.gallery.vsassets.io/_apis/public/gallery/publisher/lirandobrish/extension/sdwitextensions-dev/0.1.+/privateasset/.+/scripts/view.js
    * C:\GitRepos\WitWebControls\WebAccess\scripts\view.js
8. r8
    * regex:https://lirandobrish.gallery.vsassets.io/_apis/public/gallery/publisher/lirandobrish/extension/sdwitextensions-dev/0.1.+/privateasset/.+/scripts/XmlUtils.js
    * C:\GitRepos\WitWebControls\WebAccess\scripts\XmlUtils.js
9. r9
    * regex:https://lirandobrish.gallery.vsassets.io/_apis/public/gallery/publisher/lirandobrish/extension/sdwitextensions-dev/0.1.+/privateasset/.+/compare-form.html
    * C:\GitRepos\WitWebControls\WebAccess\compare-form.html
10. r10
    * regex:https://lirandobrish.gallery.vsassets.io/_apis/public/gallery/publisher/lirandobrish/extension/sdwitextensions-dev/0.1.+/privateasset/.+/.+.html"
    * *header:CachControl=no-cache

option 2 - need more testing , might not be useful for VSTS
    runnig with http-server
    * install http-server globally using "npm install -g http-server"
    * install OpenSSL from https://slproweb.com/products/Win32OpenSSL.html
    * install VS code "debugger for chrome" [link]
    * create an ssl certificate for http server "openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem", answer a few questions
    * copy the pem files to the extension root directory
    * update manifest to with baseUri
    * generate & upload the extension to VSTS
        "baseUri": "https://localhost:44300",
    * update VS code configurations "https://code.visualstudio.com/docs/nodejs/angular-tutorial#_debugging-angular"
<Code>
comes with the "debugger for chrome" extension
    {
    "version": "0.2.0",
    "configurations": [
        {
            "type": "chrome",
            "request": "launch",
            "name": "Launch Chrome against localhost",
            "url": "http://localhost:4200",
            "webRoot": "${workspaceRoot}"
        },
        {
            "type": "chrome",
            "request": "attach",
            "name": "Attach to Chrome",
            "port": 9222,
            "webRoot": "${workspaceRoot}"
        }
    ]
}
</Code>
    * run  "http-server -p 43300 -S --cors"
    * open chrome with a link to where the extension is in the VSTS.

## Resources: ##
* http://blog.xebia.com/debugging-your-vsts-extension/
* https://code.visualstudio.com/docs/nodejs/angular-tutorial