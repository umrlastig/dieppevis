import * as d3 from "d3";
import { tracer_vitesse, tracer_quartiles, tracer_vitesses_cumulees, tracer_plusieurs_vitesses } from './fonctions'

import { dico_devices } from './main';

let select_device_aggregation = document.getElementById("select_device_aggregation");
let choix_equipes = document.getElementById("choix_equipes");
let bouton_aggreg = document.getElementById("bouton_aggreg");

var devices = [];
var devices_names = []



export function aggregation() {

    select_device_aggregation.options[select_device_aggregation.selectedIndex].disabled = true;

    var cle = 'cle' + select_device_aggregation.value;
    var device = dico_devices[cle];
    devices.push(device);

    devices_names.push(select_device_aggregation.value);

    var div = document.createElement("div");
    div.id = select_device_aggregation.selectedIndex;
    div.name = select_device_aggregation.value
    div.classList.add('device_aggreg');
    div.innerHTML = select_device_aggregation.value;
    choix_equipes.appendChild(div);
    console.log(devices_names)

    div.addEventListener('click', function () {

        select_device_aggregation.options[div.id].disabled = false;
        div.remove();

        // Utiliser directement l'ID de l'élément div pour supprimer les éléments correspondants des listes
        var indexToRemove = devices_names.findIndex(element => element === div.name);
        console.log(indexToRemove)
        devices.splice(indexToRemove, 1);
        devices_names.splice(indexToRemove, 1);

    });

    bouton_aggreg.addEventListener('click', onClick)
}

function onClick() {



    d3.select(".message_erreur").remove()
    if (devices.length < 2) {
        var div = document.createElement("div");

        div.classList.add('message_erreur')
        div.innerHTML = '<p>Sélectionnez au moins deux équipes </p>'
        choix_equipes.appendChild(div);
    }
    else {
        var device_moy = []
        for (let j = 0; j < devices[0].length; j++) {

            device_moy.push({
                speed: d3.mean(devices.map(d => d[j].speed)),
                index: devices[0][j].index,
                x: devices[0][j].x,
                y: devices[0][j].y,
                firstQuartile: d3.quantile(devices.map(d => d[j].speed), 0.25),
                median: d3.median(devices.map(d => d[j].speed)),
                thirdQuartile: d3.quantile(devices.map(d => d[j].speed), 0.75)
            });
        }
        tracer_vitesse(device_moy)
        tracer_quartiles(device_moy)
        tracer_vitesses_cumulees(devices, devices_names)
        tracer_plusieurs_vitesses(devices, devices_names)


    }


}
