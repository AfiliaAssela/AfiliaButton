// ==UserScript==
// @name         Afilia Button
// @version      1.1.8
// @author       Afilia
// @include      *://www.leitstellenspiel.de/*
// @grant        GM_addStyle
// ==/UserScript==
/* global $ */

(async function() {
    'use strict';

    // Function to compare version numbers
    function compareVersions(v1, v2) {
        const versionParts1 = v1.split('.').map(Number);
        const versionParts2 = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(versionParts1.length, versionParts2.length); i++) {
            const part1 = versionParts1[i] || 0;
            const part2 = versionParts2[i] || 0;

            if (part1 < part2) {
                return -1;
            } else if (part1 > part2) {
                return 1;
            }
        }

        return 0;
    }

    // Fetch version from JSON file using fetch
    async function fetchVersionData() {
        try {
            const response = await fetch('https://afiliaassela.github.io/AfiliaButton/version.json');
            return await response.json();
        } catch (error) {
            console.error('Error fetching version data:', error);
            return null;
        }
    }

    function setTimeoutPreference(timeout) {
        localStorage.AfiliaTimeout = timeout;
    }

    function getTimeoutPreference() {
        return localStorage.AfiliaTimeout || 0;
    }

    function setMissionListPreference(isActive) {
        localStorage.AfiliaMissionListActive = isActive ? 'true' : 'false';
    }

    function getMissionListPreference() {
        return localStorage.AfiliaMissionListActive === 'true';
    }

    // Save Modal State
    function saveState() {
        localStorage.AfiliaState = JSON.stringify({
            config: config,
            vehicles: aVehicleTypes,
            missions: aMissions,
            allianceMissions: allianceMissions,
            missionListActive: getMissionListPreference()
        });
    }
    // Load Modal State
    function loadState() {
        const savedState = localStorage.AfiliaState;
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            config = parsedState.config;
            aVehicleTypes = parsedState.vehicles;
            aMissions = parsedState.missions;
            allianceMissions = parsedState.allianceMissions;
            setMissionListPreference(parsedState.missionListActive);
        }
    }
    // Get the version data
    const versionData = await fetchVersionData();

    // Compare versions and redirect if a higher version is detected
    if (versionData && versionData.version && compareVersions(versionData.version, GM.info.script.version) > 0) {
        const confirmation = confirm(`Eine neue Version von Afilia Button, Version: (${versionData.version}) ist verfügbar. Willst du die Update URL öffnen?`);
        if (confirmation) {
            window.location.href = versionData.updateURL1;
            setTimeout(() => {
                window.location.href = versionData.updateURL2;
            }, 1000);
        }
    }

    //Load Saved State
    loadState();

    let stopInProgress = false;

    $("body").on("click", "#AfiliaStop", function() {
        stopInProgress = true;
    });

    if(!sessionStorage.aVehicleTypesNew || JSON.parse(sessionStorage.aVehicleTypesNew).lastUpdate < (new Date().getTime() - 4 * 500 * 60)) {
        try {
            // Change from $.getJSON to fetch API
            const response = await fetch("https://afiliaassela.github.io/AfiliaButton/vehicletype.json");
            const data = await response.json();
            sessionStorage.setItem('aVehicleTypesNew', JSON.stringify({lastUpdate: new Date().getTime(), value: data}));
        } catch (error) {
            console.error('Error fetching vehicle types:', error);
        }
    }

    if(!sessionStorage.aMissions || JSON.parse(sessionStorage.aMissions).lastUpdate < (new Date().getTime() - 4 * 500 * 60)) {
        try {
            // Change from $.getJSON to fetch API
            const response = await fetch('https://www.leitstellenspiel.de/einsaetze.json');
            const data = await response.json();
            sessionStorage.setItem('aMissions', JSON.stringify({lastUpdate: new Date().getTime(), value: data}));
        } catch (error) {
            console.error('Error fetching missions:', error);
        }
    }

    var aVehicleTypes = JSON.parse(sessionStorage.aVehicleTypesNew).value;
    var aMissions = JSON.parse(sessionStorage.aMissions).value;
    var config = localStorage.AfiliaConfig ? JSON.parse(localStorage.AfiliaConfig) : {"credits": 0, "vehicles": [], "missionListActive": true};
    var allianceMissions = [];

    GM_addStyle(`.modal {
display: none;
position: fixed; /* Stay in place front is invalid - may break your css so removed */
padding-top: 100px;
left: 0;
right:0;
top: 0;
bottom: 0;
overflow: auto;
background-color: rgb(0,0,0);
background-color: rgba(0,0,0,0.4);
z-index: 9999;
}
.modal-body{
height: 650px;
overflow-y: auto;
}`);

    $("body")
        .prepend(`<div class="modal fade bd-example-modal-lg" id="AfiliaModal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg" role="document">
                      <div class="modal-content">
                        <div class="modal-header">
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&#x274C;</span>
                          </button>
                          <h5 class="modal-title"><center>Wird wieder warm nech.</center></h5>
                          <div class="btn-group">
                            <a class="btn btn-success btn-xs" id="AfiliaScan">Scan</a>
                            <a class="btn btn-success btn-xs" id="AfiliaStart">Start</a>
                            <a class="btn btn-danger btn-xs" id="AfiliaStop">Stop</a>
                            <a class="btn btn-success btn-xs" id="AfiliaPreferences">
                              <div class="glyphicon glyphicon-cog" style="color:LightSteelBlue"></div>
                            </a>
                          </div>
                        </div>
                          <div class="modal-body" id="AfiliaModalBody">
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-danger" id="close" data-dismiss="modal">Schließen</button>
                            <div class="pull-left">v ${GM_info.script.version}</div>
                          </div>
                    </div>
                  </div>`);

    $("#search_input_field_missions")
        .before(`<a id="chilloutArea" data-toggle="modal" data-target="#AfiliaModal" class="btn btn-danger btn-xs">
                   <span class="glyphicon glyphicon-queen"></span>Einsatzbereit</a>`);

    function scanMissions() {

        allianceMissions.length = 0;

        $("#mission_list_alliance .missionSideBarEntry:not(.mission_deleted)").each(function() {
            var $this = $(this);
            var missionId = +$this.attr("id").replace(/\D+/g, "");
            if (!$("#mission_participant_new_" + missionId).hasClass("hidden")) {
                var missionInfos = aMissions.filter((obj) => obj.id == +$this.attr("mission_type_id"))[0];
                var missionCredits = missionInfos ? (missionInfos.average_credits > 0 ? missionInfos.average_credits : 0) : 5E+4;
                allianceMissions.push({ "id": missionId, "typeId": +$this.attr("mission_type_id"), "credits": missionCredits, "name": $("#mission_caption_" + missionId).contents().not($("#mission_caption_" + missionId).children()).text().replace(",", "").trim(), "address": $("#mission_address_" + missionId).text().trim() });
            }
        });

        $("#mission_list_alliance_event .missionSideBarEntry:not(.mission_deleted)").each(function() {
            var $this = $(this);
            var missionId = +$this.attr("id").replace(/\D+/g, "");
            if (!$("#mission_participant_new_" + missionId).hasClass("hidden")) {
                var missionInfos = aMissions.filter((obj) => obj.id == +$this.attr("mission_type_id"))[0];
                var missionCredits = missionInfos ? (missionInfos.average_credits > 0 ? missionInfos.average_credits : 0) : 5E+4;
                allianceMissions.push({ "id": missionId, "typeId": +$this.attr("mission_type_id"), "credits": missionCredits, "name": $("#mission_caption_" + missionId).contents().not($("#mission_caption_" + missionId).children()).text().replace(",", "").trim(), "address": $("#mission_address_" + missionId).text().trim() });
            }
        });
        
        if (config.missionListActive) {
            $("#mission_list  > .missionSideBarEntry:not(.mission_deleted)").each(function() {
                var $this = $(this);
                var missionId = +$this.attr("id").replace(/\D+/g,"");
                if(!$("#mission_participant_new_"+missionId).hasClass("hidden")) {
                    var missionInfos = aMissions.filter((obj) => obj.id == +$this.attr("mission_type_id"))[0];
                    var missionCredits = missionInfos ? (missionInfos.average_credits > 0 ? missionInfos.average_credits : 0) : 5E+4;
                    allianceMissions.push({ "id": missionId, "typeId": +$this.attr("mission_type_id"), "credits": missionCredits, "name": $("#mission_caption_" + missionId).contents().not($("#mission_caption_" + missionId).children()).text().replace(",", "").trim(), "address": $("#mission_address_" + missionId).text().trim() });
                }
            });
        }

        $("#mission_list_sicherheitswache .missionSideBarEntry:not(.mission_deleted)").each(function() {
            var $this = $(this);
            var missionId = +$this.attr("id").replace(/\D+/g, "");
            if (!$("#mission_participant_new_" + missionId).hasClass("hidden")) {
                var missionInfos = aMissions.filter((obj) => obj.id == +$this.attr("mission_type_id"))[0];
                var missionCredits = missionInfos ? (missionInfos.average_credits > 0 ? missionInfos.average_credits : 0) : 5E+4;
                allianceMissions.push({ "id": missionId, "typeId": +$this.attr("mission_type_id"), "credits": missionCredits, "name": $("#mission_caption_" + missionId).contents().not($("#mission_caption_" + missionId).children()).text().replace(",", "").trim(), "address": $("#mission_address_" + missionId).text().trim() });
            }
        });

        $("#mission_list_sicherheitswache_alliance .missionSideBarEntry:not(.mission_deleted)").each(function() {
            var $this = $(this);
            var missionId = +$this.attr("id").replace(/\D+/g, "");
            if (!$("#mission_participant_new_"+missionId).hasClass("hidden")) {
                var missionInfos = aMissions.filter((obj) => obj.id == +$this.attr("mission_type_id"))[0];
                var missionCredits = missionInfos ? (missionInfos.average_credits > 0 ? missionInfos.average_credits : 0) : 5E+4;
                allianceMissions.push({ "id": missionId, "typeId": +$this.attr("mission_type_id"), "credits": missionCredits, "name": $("#mission_caption_" + missionId).contents().not($("#mission_caption_" + missionId).children()).text().replace(",", "").trim(), "address": $("#mission_address_" + missionId).text().trim() });
            }
        })

        if(allianceMissions.length >= 2) allianceMissions.sort((a, b) => a.credits > b.credits ? -1 : 1);
    }

    function writeTable() {
        var sumCredits = 0; // Initialisiere Creditzähler und setze ihn auf 0
        allianceMissions = allianceMissions.filter(e => e.credits >= config.minCredits && e.credits <= config.maxCredits);

        var intoTable =
            `<table class="table">
             <thead>
             <tr>
             <th class="col">Name</th>
             <th class="col">Adresse</th>
             <th class="col-1">Credits</th>
             <th class="col-1">Status</th>
             </tr>
             </thead>
             <tbody>`;

        for(var i in allianceMissions) {
            var e = allianceMissions[i];

            if(e.credits < config.credits) {
                delete allianceMissions[i];
                continue;
            }

            sumCredits += e.credits; //Credits zur Summe hinzufügen

            intoTable +=
                `<tr id="tr_${e.id}" class="alert alert-info">
                   <td class="col">
                     <a class="lightbox-open" href="/missions/${e.id}">${e.name.replace("[Verband]", "<span class='glyphicon glyphicon-asterisk'></span>").replace("[Event]", "<span class='glyphicon glyphicon-star'></span>")}</a>
                   </td>
                   <td class="col">${e.address}</td>
                   <td class="col-1">${e.credits.toLocaleString()}</td>
                   <td class="col-1" id="status_${e.id}"></td>
                 </tr>`;
        }

        intoTable += 
            `<tr>
               <td colspan="2" class="col">Durchschnittlicher Gesamtertrag:</td>
               <td class="col-1">${sumCredits.toLocaleString()}</td>
               <td class="col-1"></td>
            </tr>
            </tbody>
            </table>`;

        $("#AfiliaModalBody").html(intoTable);
    }

async function alertVehicles() {
    var foundVehicles = [];

    for(var i in allianceMissions) {
        if (stopInProgress) {
            stopInProgress = false;
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, getTimeoutPreference()));
        var mId = allianceMissions[i].id;
        $("#status_"+mId).text("suche ...");
        var mission = await $.get("/missions/"+mId, (data) => data);
        var checkboxes = $(".vehicle_checkbox", mission);
        for(var v = 0; v < checkboxes.length; v++) {
            var vAttr = checkboxes[v].attributes;
            var vType = +vAttr.vehicle_type_id.value;
            var vId = +vAttr.value.value;

            if(config.vehicles.includes(vType) && !foundVehicles.includes(vId)) {
                $("#status_"+mId).text("alarmiere ...");
                await $.post('/missions/' + mId + '/alarm', {'vehicle_ids' : vId}).done(function() {
                    foundVehicles.push(vId);
                    $("#tr_"+mId).remove();
                    console.log(foundVehicles);
                });
                break;
            }

            if(v+1 == checkboxes.length) {
                $("#tr_"+mId).removeClass("alert-info").addClass("alert-danger");
                $("#status_"+mId).text("Fahrzeuge außer Reichweite oder nicht vorhanden!");
                break;
            }
        }
    }
}

    function mapVehicles(arrClasses, trigger) {
        var returnValue = [];
        if (arrClasses && arrClasses.length) { 
            if (trigger == "type") {
                arrClasses.forEach(function (item) {
                    var matchingVehicle = aVehicleTypes.find((obj) => obj.short_name === item);
                    if (matchingVehicle) {
                        returnValue.push(matchingVehicle.id);
                    }
                });
            } else if (trigger == "name") {
                arrClasses.forEach(function (item) {
                    var matchingVehicle = aVehicleTypes.find((obj) => obj.id === item);
                    if (matchingVehicle) {
                        returnValue.push(matchingVehicle.short_name);
                    }
                });
            }
        }
        return returnValue;
    }

   $("body").on("click", "#chilloutArea", function() {
        if (allianceMissions.length === 0) {
            $("#AfiliaModalBody").html(`<center><img src="https://www.garten-informationen.de/wp-content/uploads/2017/03/japanischer-garten.jpg" style="height:60%;width:60%"></center>`);
        }
    });

    $("body").on("click", "#AfiliaScan", async function() {
        await scanMissions();
        await writeTable();
    });

    $("body").on("click", "#AfiliaStart", function() {
        alertVehicles();
    });

    $("body").on("click", "#AfiliaPreferences", function() {
        var arrVehicles = [];
        for (var i in aVehicleTypes) {
            arrVehicles.push(aVehicleTypes[i].short_name);
        }
        arrVehicles.sort((a, b) => a.toUpperCase() > b.toUpperCase() ? 1 : -1);
    
        $("#AfiliaModalBody").html(`
            <span>Einsätze ab </span>
            <input type="text" class="form-control form-control-sm" value="${config.minCredits || 0}" id="AfiliaMinCredits" style="width:5em;height:22px;display:inline">
            <span> bis </span>
            <input type="text" class="form-control form-control-sm" value="${config.maxCredits || 1000000}" id="AfiliaMaxCredits" style="width:5em;height:22px;display:inline">
            <span> Credits anzeigen</span>
            <br><br>
            <label for="AfiliaTimeout">Timeout (ms): </label><input type="text" class="form-control form-control-sm" value="${getTimeoutPreference()}" id="AfiliaTimeout" style="width:5em;height:22px;display:inline"><span> ms</span>
            <br><br>
            <label for="AfiliaMissionListActive">Eigene Einsätze berücksichtigen?</label>
            <input type="checkbox" id="AfiliaMissionListActive" ${config.missionListActive ? 'checked' : ''}>
            <br><br>
            <label for="AfiliaVehicleTypes">Fahrzeugtypen (Mehrfachauswahl mit Strg + Klick)</label>
            <select multiple class="form-control" id="AfiliaVehicleTypes" style="height:20em;width:40em"></select>
            <br><br>
            <a class="btn btn-success" id="AfiliaBtnSave">Speichern</a>
        `);
    
        for (i in arrVehicles) {
            $("#AfiliaVehicleTypes").append(`<option>${arrVehicles[i]}</option>`);
        }
    
        $("#AfiliaVehicleTypes").val(mapVehicles(config.vehicles, "name"));
    });

    $("body").on("click", "#AfiliaBtnSave", function() {
        config.minCredits = +$("#AfiliaMinCredits").val();
        config.maxCredits = +$("#AfiliaMaxCredits").val();
        config.vehicles = mapVehicles($("#AfiliaVehicleTypes").val(), "type");
        config.missionListActive = $("#AfiliaMissionListActive").is(":checked");
        localStorage.AfiliaConfig = JSON.stringify(config);
    
        var timeoutValue = $("#AfiliaTimeout").val();
        setTimeoutPreference(timeoutValue);
    
        $("#AfiliaModalBody").html("<h3><center>Einstellungen gespeichert</center></h3>");
    });

    $("body").on("click", "#close", function() {
        // Save the state when the "Schließen" button is clicked
        saveState();
    });

})();
