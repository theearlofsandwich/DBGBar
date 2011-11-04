if(!com) var com={};
if(!com.originallight) com.originallight={};

com.originallight.phpdebuggerPrefs = function(){

    var public = {};

    public.getclienthost = function(){
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.phpdebugger.");
        if (prefs.prefHasUserValue("optclienthost"))
            return (prefs.getCharPref("optclienthost"));
        else
            return ("clienthost");
    }

    public.getport = function(){
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.phpdebugger.");
        if (prefs.prefHasUserValue("optport"))
            return (prefs.getCharPref("optport"));
        else
            return ("7869");
    }

    public.getsessid = function(){
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.phpdebugger.");
        if (prefs.prefHasUserValue("optsessid"))
            return (prefs.getCharPref("optsessid"));
        else
            return (Math.floor(Math.random() * 999999) + 1);
    }


    public.geturls = function(){
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.phpdebugger.");
        if (prefs.prefHasUserValue("opturls"))
            return (prefs.getCharPref("opturls"));
        else
            return ("http://localhost");
    }


    public.initializeOptions = function(){

        document.getElementById("phpdebugger_clienthost").value = com.originallight.phpdebuggerPrefs.getclienthost();
        document.getElementById("phpdebugger_port").value = com.originallight.phpdebuggerPrefs.getport();
        document.getElementById("phpdebugger_sessid").value = com.originallight.phpdebuggerPrefs.getsessid();
        document.getElementById("phpdebugger_validurls").value = com.originallight.phpdebuggerPrefs.geturls();
    }

    public.saveOptions = function(){

        var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.phpdebugger.");
        prefs.setCharPref("optclienthost", document.getElementById("phpdebugger_clienthost").value);
        prefs.setCharPref("optport", document.getElementById("phpdebugger_port").value);
        prefs.setCharPref("optsessid", document.getElementById("phpdebugger_sessid").value);
        prefs.setCharPref("opturls", document.getElementById("phpdebugger_validurls").value);
    }

    public.showurls = function(){
    // Get the menupopup element that we will be working with
        var menu = document.getElementById("phpdebugger-urlmenu");

    // Remove all of the items currently in the popup menu
        for (var i = menu.childNodes.length - 1; i >= 0; i--){
            menu.removeChild(menu.childNodes.item(i));
        }

        var validurls = com.originallight.phpdebuggerPrefs.geturls();
        var allurls = validurls.split("\n");

    // Specify how many items we should add to the menu
        for (f = 0; f < allurls.length; f++){
            if (allurls[f].length > 1){
                var tempItem = document.createElement("menuitem");

    // Set the new menu item's label
                tempItem.setAttribute("label", allurls[f]);

    // Only do this step if a * character is not found
                if (allurls[f].indexOf("*") ==  - 1){
                    tempItem.setAttribute("oncommand", "com.originallight.phpdebugger.gotourl(\"" + allurls[f] + "\");");
                }
                else{
                    tempItem.setAttribute("disabled", "true");
                }

                tempItem.setAttribute("tooltiptext", allurls[f]);
    // Add the item to our menu
                menu.appendChild(tempItem);
            }
        }
        var tempItem = document.createElement("menuseparator");
        menu.appendChild(tempItem);

        var tempItem = document.createElement("menuitem");
        tempItem.setAttribute("label", "Options");
        tempItem.setAttribute("oncommand", "com.originallight.phpdebugger.OpenOptions();");
        tempItem.setAttribute("tooltiptext", "Options");
    // Add the item to our menu
        menu.appendChild(tempItem);

    }

    return public;
}();