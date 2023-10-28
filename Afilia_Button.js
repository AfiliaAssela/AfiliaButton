// ==UserScript==
// @name         Blaulicht Button
// @version      1.0.0
// @author       Archangel
// @include      *://www.leitstellenspiel.de/*
// @grant        GM_addStyle
// ==/UserScript==
/* global $ */

(async function() {
    'use strict';

    if(!sessionStorage.aVehicleTypesNew || JSON.parse(sessionStorage.aVehicleTypesNew).lastUpdate < (new Date().getTime() - 4 * 500 * 60)) {
            await $.getJSON("https://afiliaassela.github.io/jsons/vehicletype.json").done(data => sessionStorage.setItem('aVehicleTypesNew', JSON.stringify({lastUpdate: new Date().getTime(), value: data})) );
        }

    if(!sessionStorage.aMissions || JSON.parse(sessionStorage.aMissions).lastUpdate < (new Date().getTime() - 4 * 500 * 60)) {
        await $.getJSON('https://afiliaassela.github.io/jsons/einsaetze.json').done(data => sessionStorage.setItem('aMissions', JSON.stringify({lastUpdate: new Date().getTime(), value: data})) );
    }

    var aVehicleTypes = JSON.parse(sessionStorage.aVehicleTypesNew).value;
    var aMissions = JSON.parse(sessionStorage.aMissions).value;
    var config = localStorage.chiAConfig ? JSON.parse(localStorage.chiAConfig) : {"credits": 0, "vehicles": []};
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
        .prepend(`<div class="modal fade bd-example-modal-lg" id="chiAModal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg" role="document">
                      <div class="modal-content">
                        <div class="modal-header">
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&#x274C;</span>
                          </button>
                          <h5 class="modal-title"><center>Lasst uns mal schauen was es zu tun gibt.</center></h5>
                          <div class="btn-group">
                            <a class="btn btn-success btn-xs" id="chiAScan">Scan</a>
                            <a class="btn btn-success btn-xs" id="chiAStart">Start</a>
                            <a class="btn btn-success btn-xs" id="chiAPreferences">
                              <div class="glyphicon glyphicon-cog" style="color:LightSteelBlue"></div>
                            </a>
                          </div>
                        </div>
                          <div class="modal-body" id="chiAModalBody">
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-danger" id="close" data-dismiss="modal">Schließen</button>
                            <div class="pull-left">v ${GM_info.script.version}</div>
                          </div>
                    </div>
                  </div>`);

    $("#btn-group-mission-select")
        .before(`<a id="chilloutArea" data-toggle="modal" data-target="#chiAModal" class="btn btn-success btn-xs">
                   <span class="glyphicon glyphicon-queen"></span> Blaulicht Button
                 </a>`);

    function scanMissions() {

        allianceMissions.length = 0;

        $("#mission_list .missionSideBarEntry:not(.mission_deleted)").each(function() {
            var $this = $(this);
            var missionId = +$this.attr("id").replace(/\D+/g, "");
            if (!$("#mission_participant_new_" + missionId).hasClass("hidden")) {
                var missionInfos = aMissions.filter((obj) => obj.id == +$this.attr("mission_type_id"))[0];
                var missionCredits = missionInfos ? (missionInfos.average_credits > 0 ? missionInfos.average_credits : 0) : 5E+4;
                allianceMissions.push({ "id": missionId, "typeId": +$this.attr("mission_type_id"), "credits": missionCredits, "name": $("#mission_caption_" + missionId).contents().not($("#mission_caption_" + missionId).children()).text().replace(",", "").trim(), "address": $("#mission_address_" + missionId).text().trim() });

            }
        });

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
               $("#mission_lt  > .missionSideBarEntry:not(.mission_deleted)").each(function() {
            var $this = $(this);
            var missionId = +$this.attr("id").replace(/\D+/g,"");
            if(!$("#mission_participant_new_"+missionId).hasClass("hidden")) {
    var missionInfos = aMissions.filter((obj) => obj.id == +$this.attr("mission_type_id"))[0];
                var missionCredits = missionInfos ? (missionInfos.average_credits > 0 ? missionInfos.average_credits : 0) : 5E+4;
                allianceMissions.push({ "id": missionId, "typeId": +$this.attr("mission_type_id"), "credits": missionCredits, "name": $("#mission_caption_" + missionId).contents().not($("#mission_caption_" + missionId).children()).text().replace(",", "").trim(), "address": $("#mission_address_" + missionId).text().trim() });
            }
        });

        $("#mission_list_sicherheitswache .missionSideBarEntry:not(.mission_deleted)").each(function() {
            var $this = $(this);
            var missionId = +$this.attr("id").replace(/\D+/g, "");
            if (!$("#mission_participant_new_" + missionId).hasClass("hidden")) {
                var missionInfos = aMissions.filter((obj) => obj.id == +$this.attr("mission_type_id"))[0];
                var missionCredits = missionInfos ? (missionInfos.average_credits > 0 ? missionInfos.average_credits : 0) : 5E+4;
                allianceMissions.push({ "id": missionId, "typeId": +$this.attr("mission_type_id"), "credits": missionCredits, "name": $("#mission_caption_" + missionId).contents().not($("#mission_caption_" + missionId).children()).text().replace(",", "").trim(), "address": $("#mission_address_" + missionId).text().trim() });
            }
        });

        if(allianceMissions.length >= 2) allianceMissions.sort((a, b) => a.credits > b.credits ? -1 : 1);
    }

    function writeTable() {
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

        intoTable += `</tbody>
                      </table>`;

        $("#chiAModalBody").html(intoTable);
    }

async function alertVehicles() {
    var foundVehicles = [];

    for(var i in allianceMissions) {
        await new Promise(resolve => setTimeout(resolve, 20));
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
                $("#status_"+mId).text("Aufgepasst! Keine Fahrzeuge!");
                break;
            }
        }
    }
}

    function mapVehicles(arrClasses, trigger) {
        var returnValue = [];
        if(trigger == "type") {
            returnValue = $.map(arrClasses, function(item) {
                return aVehicleTypes.filter((obj) => obj.short_name == item)[0].id;
            });
        } else if(trigger == "name") {
            returnValue = $.map(arrClasses, function(item) {
                return aVehicleTypes.filter((obj) => obj.id == item)[0].short_name;
            });
        }
        return returnValue;
    }

   $("body").on("click", "#chilloutArea", function() {
        $("#chiAModalBody").html(`<center><img src="https://abload.de/img/1c3bc873917eba22dc8185timd.jpg" style="height:60%;width:60%"></center>`);
        allianceMissions.length = 0;
    });

    $("body").on("click", "#chiAScan", async function() {
        await scanMissions();
        await writeTable();
    });

    $("body").on("click", "#chiAStart", function() {
        alertVehicles();
    });

    $("body").on("click", "#chiAPreferences", function() {
        var arrVehicles = [];

        for(var i in aVehicleTypes) {
            arrVehicles.push(aVehicleTypes[i].short_name);
        }
        arrVehicles.sort((a, b) => a.toUpperCase() > b.toUpperCase() ? 1 : -1);

        $("#chiAModalBody")
            .html(`<span>Einsätze ab </span><input type="text" class="form-control form-control-sm" value="${config.credits}" id="chiACredits" style="width:5em;height:22px;display:inline"><span> Credits anzeigen</span>
                   <br>
                   <br>
                   <label for="chiAVehicleTypes">Fahrzeugtypen (Mehrfachauswahl mit Strg + Klick)</label>
                   <select multiple class="form-control" id="chiAVehicleTypes" style="height:20em;width:40em"></select>
                   <br>
                   <br>
                   <a class="btn btn-success" id="chiABtnSave">Speichern</a>`);

        for(i in arrVehicles) {
            $("#chiAVehicleTypes").append(`<option>${arrVehicles[i]}</option>`);
        }

        $("#chiAVehicleTypes").val(mapVehicles(config.vehicles, "name"));
    });

    $("body").on("click", "#chiABtnSave", function() {
        config.credits = +$("#chiACredits").val();
        config.vehicles = mapVehicles($("#chiAVehicleTypes").val(), "type");
        localStorage.chiAConfig = JSON.stringify(config);

        $("#chiAModalBody").html("<h3><center>Einstellungen gespeichert</center></h3>");
    });

})();
