if(!com) var com={};
if(!com.originallight) com.originallight={};

com.originallight.phpdebugger = function(){
    var public = {};

	var submitdone = false, debugimmediately = false;
    
    public.urlBarListener = {
            QueryInterface: function(aIID){
                if (aIID.equals(Components.interfaces.nsIWebProgressListener) || aIID.equals(Components.interfaces.nsISupportsWeakReference) || aIID.equals(Components.interfaces.nsISupports))
                    return this;
                throw Components.results.NS_NOINTERFACE;
            }
            , 
        
            onLocationChange: function(aProgress, aRequest, aURI){
                com.originallight.phpdebugger.processNewURL(aURI);
            }
            , 
        
            onStateChange: function(){}
            , onProgressChange: function(){}
            , onStatusChange: function(){}
            , onSecurityChange: function(){}
            , onLinkIconAvailable: function(){}
        
        };

    public.oldurl = "";

	public.init = function(){
		com.originallight.phpdebuggerPrefs.showurls();
        com.originallight.phpdebugger.killsession();
// Listen for webpage loads
		gBrowser.addProgressListener(com.originallight.phpdebugger.urlBarListener, Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
		gBrowser.addEventListener("load", onPageLoadinit, true);
		gBrowser.addEventListener("submit", onsubmit, false);
	};

	public.uninit = function(){
		com.originallight.phpdebugger.killsession();
		gBrowser.removeProgressListener(com.originallight.phpdebugger.urlBarListener);
        gBrowser.removeEventListener("load", onPageLoadinit, true);
        gBrowser.removeEventListener("submit", onsubmit, false);        
	};
    
    public.close = function(){
        com.originallight.phpdebugger.killsession();
    };    

	public.processNewURL = function(aURI){
		if (aURI.spec == com.originallight.phpdebugger.oldURL){
			return ;
        }
// now we know the url is new...
//alert(aURI.spec);
		onPageLoad();
		com.originallight.phpdebugger.oldURL = aURI.spec;
	};    
    
    

    function setbutton(whichbutton, type){
    //alert("setting button to "+whichbutton);
        checkMenuItem( "nextpage", type, "false");
        checkMenuItem( "nextpost", type, "false");
        checkMenuItem( "session", type, "false");
        if( whichbutton != "none" ){
            checkMenuItem( whichbutton, type, "true");
        }
    };

    function checkMenuItem(whichbutton, type, state){
        document.getElementById("phpdebugger_" + type + whichbutton + "btn").setAttribute("checked", state);
    };

    function getButtonChecked(whichbutton, type){
        if (document.getElementById("phpdebugger_" + type + whichbutton + "btn").getAttribute("checked") == "false") {
            return false;
        } else {
            return true;
        }
    };

    public.debugpage = function(type){
        var clthost = com.originallight.phpdebuggerPrefs.getclienthost(),
            port = com.originallight.phpdebuggerPrefs.getport(),
            sessid = com.originallight.phpdebuggerPrefs.getsessid();

        if( type == "debug"){
            SetCookie("DBGSESSID", sessid + "@" + clthost + ":" + port + ";d=1,p=0,c=0", 1);
        } else {
            SetCookie("DBGSESSID", sessid + "@" + clthost + ":" + port + ";d=0,p=1,c=0", 1);
        }

        debugimmediately = true;
        BrowserReload();
        docookiefrombuttons();
    };

    public.debugnextpage = function(type){
    //alert("debug next page");
        if (getButtonChecked("nextpage", type) == true){
            setbutton("none", type);
        } else {
            setbutton("nextpage", type);
        }

        docookiefrombuttons();
    }

    public.debugnextpost = function(type){
        if (getButtonChecked("nextpost", type) == true){
            setbutton("none", type);
        } else{
    // Turn it off just in case next page or session was on
            setbutton("nextpost", type);
        }
        docookiefrombuttons();
    }

    public.debugsession = function(type){
        if (getButtonChecked("session", type) == true){
            setbutton("none", type);
        } else {
            setbutton("session", type);
        }
        docookiefrombuttons();
    }


    public.gotourl = function(url){
        window._content.document.location = url;
        window.content.focus();
    }

    function SetCookie(cookieName, cookieValue, nDays){
        //alert("setting cookie");
        /*var today = new Date();
        var expire = new Date();
        if (nDays == null || nDays == 0)
            nDays = 1;
        expire.setTime(today.getTime() + 3600000 * 24 * nDays);
        var expirestring = "; expires="+expire.toGMTString();*/
        window._content.document.cookie = cookieName + "=" + escape(cookieValue) + "; path=/";

    }

    function docookiefrombuttons(){
        var d=0,
            p=0,
            c=0,
            clthost = com.originallight.phpdebuggerPrefs.getclienthost(),
            port = com.originallight.phpdebuggerPrefs.getport(),
            sessid = com.originallight.phpdebuggerPrefs.getsessid();

        if( (getButtonChecked("nextpage", "debug") || getButtonChecked("session", "debug")) ||
                ( getButtonChecked("nextpost", "debug") && submitdone == true ) ){
            d = 1;
        }
        if( (getButtonChecked("nextpage", "profile") || getButtonChecked("session", "profile")) ||
                ( getButtonChecked("nextpost", "profile") && submitdone == true ) ){
            p = 1;
        }
        // Always for the session, we will deal with turning this on and off ourselves
        c = 1;
        //}

        SetCookie("DBGSESSID", sessid + "@" + clthost + ":" + port + ";d=" + d + ",p=" + p + ",c=" + c, 1);
    }


    public.killsession = function(){
        setbutton("none", "debug");
        setbutton("none", "profile");
        SetCookie("DBGSESSID", "-1", 1);
    }


    public.OpenOptions = function(){
        window.openDialog("chrome://phpdebugger/content/preferences.xul", "DBGbar Options", "centerscreen,chrome,modal");
    }

    public.OpenAbout = function(){
        window.openDialog("chrome://phpdebugger/content/about.xul", "About DBGbar", "centerscreen,chrome,modal");
    }


    function onsubmit(aEvent){
    // If the next post button is checked
        if (getButtonChecked("nextpost", "debug") == true || getButtonChecked("nextpost", "profile") == true){
    // Set the cookie and set debugstatus to 1 so we can turn it off on the next page load
            submitdone = true;
            docookiefrombuttons();
        }
    }

    // On every real page load, check to see the debug status so we can turn off menu items if need be
    function onPageLoadinit(event){
        var resetCookie = false;
        //alert("debug this done = " + debugthisdone);
        if (event.originalTarget instanceof HTMLDocument){
            if(debugimmediately == false){
                
                if ( (submitdone == true && getButtonChecked("nextpost", "debug") == true) ||
                      ( getButtonChecked("nextpage", "debug") == true)){
                    setbutton("none", "debug");
                    resetCookie = true;
                }

                if ( (submitdone == true && getButtonChecked("nextpost", "profile") == true) ||
                      ( getButtonChecked("nextpage", "profile") == true )){
                    setbutton("none", "profile");
                    resetCookie = true;

                }
                if( resetCookie == true ){
                    submitdone = false;
                    docookiefrombuttons();
                }
            }
            
            if(debugimmediately==true){
                docookiefrombuttons();
            }
            
            debugimmediately = false;
            
            onPageLoad(event);
        }
                
    }



    function onPageLoad(aEvent){

    //alert("page loaded");

        var browser = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex),
            matched = false;
    // Make sure the doc is initialised
        if (browser.currentURI.spec != public.oldurl){
            public.oldurl = browser.currentURI.spec;

            var validurls = com.originallight.phpdebuggerPrefs.geturls(),
                allurls = validurls.split("\n");

    // Repeat through each url converting wildcards to regexp and check

            for (var f = 0; f < allurls.length; f++){
                if (allurls[f].length > 0){
                    result = allurls[f].replace(/([\\/\|\(\)\[\{\^\$\+\.\<\>\?])/g, "\\$1");
                    result = result.replace(/\*/g,".*?");

                    var myregexp = new RegExp(result, "gi");
                    if (myregexp.test(browser.currentURI.spec)){
                        matched = true;
                    }
                }
            }
            if (matched){
                document.getElementById("phpdebugger-MainMenu").setAttribute("disabled", "false");
                document.getElementById("phpdebugger-Profile").setAttribute("disabled", "false");
            }
            else{
                document.getElementById("phpdebugger-MainMenu").setAttribute("disabled", "true");
                document.getElementById("phpdebugger-Profile").setAttribute("disabled", "true");

            }
        }
    }

    return public;
}();

window.addEventListener("load", function(){com.originallight.phpdebugger.init()}, false);
window.addEventListener("unload", function(){com.originallight.phpdebugger.uninit()}, false);
window.addEventListener("close", function(){com.originallight.phpdebugger.close()}, false);
