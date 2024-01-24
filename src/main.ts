import data3607 from "../data/interpolated/interpolation_3607.csv";
import data3609 from "../data/interpolated/interpolation_3609.csv";
import data3610 from "../data/interpolated/interpolation_3610.csv";
import data3611 from "../data/interpolated/interpolation_3611.csv";
import data3612 from "../data/interpolated/interpolation_3612.csv";
import data3613 from "../data/interpolated/interpolation_3613.csv";
import data3615 from "../data/interpolated/interpolation_3615.csv";

import {
  tracer_ligne,
  tracer_vitesse,
  tracer_parcours,
  carte_leaflet,
} from "./fonctions";
import { aggregation } from "./aggregation";

let select_device_aggregation = document.getElementById(
  "select_device_aggregation"
);

let choix_device = document.getElementById("choix_device");

var device;

export let dico_devices = {
  cle3607: data3607,
  cle3609: data3609,
  cle3610: data3610,
  cle3611: data3611,
  cle3612: data3612,
  cle3613: data3613,
  cle3615: data3615,
};

carte_leaflet(data3607);
tracer_ligne(data3607);
tracer_parcours(data3607);

choix_device.addEventListener("change", function () {
  var cle = "cle" + choix_device.value;
  device = dico_devices[cle];

  tracer_vitesse(device);
});

select_device_aggregation.addEventListener("change", aggregation);
