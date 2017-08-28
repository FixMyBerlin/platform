
/* LOAD ================================================================================== */

window.onload = function () {
      load();
}

window.onpopstate = function (event) {
      popstate(event);
}

function load() {

    if ($$("map_overlay_bignumber_slider")) { // große nummern initialiseren
        bignumberInit();
    }    
    
    if (document.getElementsByTagName("BODY")[0]) {
        if (document.getElementsByTagName("BODY")[0].className.indexOf("path-frontpage")<=0) { // ist nicht die startseite, dann detail anzeigen
            projectExpandManual();
        }
    }
    
}

function popstate(event) {
    console.log("popstate");
    
    /*
    
        if (event.state==null) {
        popupClose(); // wenn keine daten, dann wird das popup auf jeden fall geschlossen
    } else {
        if (event.state["loaded_in_popup"]==false||event.state["loaded_in_popup"]==null) { // daten, aber nicht im popup geladen, dann popup schließen
            popupClose(); // wenn keine daten, dann wird das popup auf jeden fall geschlossen
        } else { // es gibt daten, und im popup geladen
            get(event.state["url"], "popupOpenEnd", null, null); // popup öffnen (aber ohne neuen state zu erzeugen)
            popupOpen();
        }
    }
    
    
 




    
    */
}

/* GENERAL =============================================================================== */


var is_map_action_moved=false;

function mapActionDown() {
    is_map_action_moved=false;
}

function mapActionMove() {
    is_map_action_moved=true;
}

function mapAction() {

    if (!is_map_action_moved) { // alle map drags ignorieren
        
        projectCollapse();
        mapRemoveMarkings(); // alle verbleibenden markings weg
        
        is_map_action_moved=false;
        
    }

}

/* SIDEBAR =============================================================================== */

/* Project Load ———————————————————————————————————————— */

function loadProjectByUUID(uuid) {
    projectExpand(project_mapping[uuid].alias);
}

var is_project_visible=false;

function projectExpand(alias) {

    if (is_project_visible) { // gab schon ein anderes projekt
        projectCollapse();
        window.setTimeout("projectExpandLoad('"+alias+"');",300);
    } else {
        projectExpandLoad(alias);
    }

    is_project_visible=true;
}

var load_time_start=null;

function projectExpandLoad(alias) {

    load_time_start=Date.now();
    
    get(alias, "projectExpandEnd", "projectExpandFailed", null, []);
    
    $$("map_overlay_inner").innerHTML=""; // leeren container schon zeigen
    $$("map_overlay_container").className="";
    $$("map_overlay_loader").style.opacity=1;
    $$("map_overlay_inner").style.opacity=0;
    
    history.pushState({"url":alias,"is_popup_open":true}, "", alias); // virtuellen seitenwechsel auf projekt detail

}

function projectExpandEnd(inhalt) {

    console.log("Project Loaded "+(Date.now()-load_time_start)+"ms");
    
    if (inhalt.indexOf("<!-- MAP OVERLAY INNER START -->")>=0&&inhalt.indexOf("<!-- MAP OVERLAY INNER END -->")>=0) { // ist ein valides html
        
        var overlay_content_html=inhalt.split("<!-- MAP OVERLAY INNER START -->")[1].split("<!-- MAP OVERLAY INNER END -->")[0];
        $$("map_overlay_inner").innerHTML=overlay_content_html;
        $$("map_overlay_loader").style.opacity=0;
        $$("map_overlay_inner").style.opacity=1;
    
    }

}

function projectExpandFailed(inhalt) {
    
}

function projectExpandManual() {
    $$("map_overlay_container").className="";
}

function projectCollapse() {
    $$("map_overlay_container").className="map_overlay_container_hidden";
    is_project_visible=false;
    history.pushState({"url":"/","is_popup_open":false}, "", "/"); // virtuellen seitenwechsel auf leere seite
}    
    
/* Big Number ———————————————————————————————————————— */

var current_big_number_index=0;

function bignumberInit() {
    window.setInterval(bignumberStep, 5000);
}

function bignumberStep() {

    $$("map_overlay_bignumber_slider").style.transform="translate3d(-"+(current_big_number_index*25)+"%,0px,0)";

    current_big_number_index++;
    if (current_big_number_index>=4) {
        current_big_number_index=0;
    }
    
}

/* Voting ———————————————————————————————————————————— */

var is_voting_extended=false;

function votingAction(element) {
    if (is_voting_extended) {
        votingCollapse();
    } else {
        votingExtend(element);
    }
}

function votingExtend(element) {

    var current_voting_type=element.id.split("map_overlay_voting_container_")[1];
    
    if (current_voting_type!="gut") { // alle ausser gut werden extended
       
        // voting container extenden
        $$("map_overlay_voting").className="map_overlay_voting_extended";
       
        // voting container ausblenden und verschieben
        var voting_container_elements=document.getElementsByClassName("map_overlay_voting_container");
        for (var i=0;i<voting_container_elements.length;i++) {
            if (voting_container_elements[i]==element) { // das aktuelle element
                voting_container_elements[i].style.left="0px";
               // voting_container_elements[i].style.width="200px";
            } else { // alle anderen elemente
                voting_container_elements[i].style.opacity=0;
            }
        }
        
        // feedback container einblenden
        $$("map_overlay_voting_feedback").style.display="flex";
        window.setTimeout('$$("map_overlay_voting_feedback").style.opacity=1;',0);
        
        // richtige überschrift anzeigen
        $$("map_overlay_voting_feedback_title_"+current_voting_type).style.display="block";
        $$("map_overlay_voting_feedback_field").placeholder=$$("map_overlay_voting_feedback_placeholder_"+current_voting_type).innerText;
        
        is_voting_extended=true;
    
    }
   
}

function votingCollapse() {

    // voting container schrumpfen
    $$("map_overlay_voting").className="";
       
    // voting container anzeigen und verschieben
    var voting_container_elements=document.getElementsByClassName("map_overlay_voting_container");
    for (var i=0;i<voting_container_elements.length;i++) {
        voting_container_elements[i].style.left="";
        voting_container_elements[i].style.opacity=1;
    }
    
    // feedback container ausblenden
    $$("map_overlay_voting_feedback").style.opacity=0;
    window.setTimeout('$$("map_overlay_voting_feedback").style.display="none";',200);
    
    is_voting_extended=false;

}

/* HELPER =============================================================================== */

function zufall(a,b) {
    return Math.floor(Math.random()*(b-a+1))+a;
}

function $$(id) {
    return document.getElementById(id);
}

function post(url, callback_function, fail_function, callback_id, parameter){
try {

 //   parameter.push(["random",Math.random()]);
    for (var i=0;i<parameter.length;i++) { // alle parameter values uri encodieren
        parameter[i][1]=encodeURIComponent(parameter[i][1]);
        parameter[i]=parameter[i].join("=");
    }
    parameter=parameter.join("&");
    
    var http_request = new XMLHttpRequest();
    http_request.overrideMimeType('text/xml; charset=UTF-8');
    
    http_request.onreadystatechange = function() {
   // alert(http_request.status);
        if (http_request.readyState == 4) {
            if (http_request.status == 200) {
                if (callback_function!=null&&callback_id!=null) {
                    window[callback_function](callback_id,http_request.responseText);
                } else if (callback_function!=null) {
                    window[callback_function](http_request.responseText);
                }
            } else {//if (http_request.status!=0) {
              //  alert("Fehler. "+http_request.status+". "+http_request.responseText);
                
                if (fail_function!=null&&callback_id!=null) {
                    window[fail_function](callback_id,http_request.status);
                } else if (fail_function!=null) {
                    window[fail_function](http_request.status);
                }

            }
        }
    }
    
    //  http_request.onprogress = function(event) {
    //      if (event.lengthComputable) {
    //          $("navigation_progress").style.webkitTransform="translate3d("+ ( -70+   ((event.loaded/event.total)*70)    )+"%,0px,0)";
    //      }
    //  }
    
    http_request.open('POST', url,true);
    http_request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    http_request.send(parameter);
    
} catch(e) {
    console.log("AJAX. ");
}

}

function get(url, callback_function, fail_function, callback_id, parameter){
try {

 //   parameter.push(["random",Math.random()]);
    for (var i=0;i<parameter.length;i++) { // alle parameter values uri encodieren
        parameter[i][1]=encodeURIComponent(parameter[i][1]);
        parameter[i]=parameter[i].join("=");
    }
    parameter=parameter.join("&");
    
    var http_request = new XMLHttpRequest();
    http_request.overrideMimeType('text/xml; charset=UTF-8');
    
    http_request.onreadystatechange = function() {
   // alert(http_request.status);
        if (http_request.readyState == 4) {
            if (http_request.status == 200) {
                if (callback_function!=null&&callback_id!=null) {
                    window[callback_function](callback_id,http_request.responseText);
                } else if (callback_function!=null) {
                    window[callback_function](http_request.responseText);
                }
            } else {//if (http_request.status!=0) {
              //  alert("Fehler. "+http_request.status+". "+http_request.responseText);
                
                if (fail_function!=null&&callback_id!=null) {
                    window[fail_function](callback_id,http_request.status);
                } else if (fail_function!=null) {
                    window[fail_function](http_request.status);
                }

            }
        }
    }
    
    //  http_request.onprogress = function(event) {
    //      if (event.lengthComputable) {
    //          $("navigation_progress").style.webkitTransform="translate3d("+ ( -70+   ((event.loaded/event.total)*70)    )+"%,0px,0)";
    //      }
    //  }
    
    http_request.open('GET', url,true);
    http_request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    http_request.send(parameter);
    
} catch(e) {
    console.log("AJAX. ");
}

}

