import bebes01 from '../assets/galeria/bebes/bebes-01.jpg'
import bebes02 from '../assets/galeria/bebes/bebes-02.jpg'
import bebes03 from '../assets/galeria/bebes/bebes-03.jpg'
import bebes04 from '../assets/galeria/bebes/bebes-04.jpg'
import bebes05 from '../assets/galeria/bebes/bebes-05.jpg'
import bebes06 from '../assets/galeria/bebes/bebes-06.jpg'
import bebes07 from '../assets/galeria/bebes/bebes-07.jpg'
import bebes08 from '../assets/galeria/bebes/bebes-08.jpg'
import bebes09 from '../assets/galeria/bebes/bebes-09.jpg'
import bebes10 from '../assets/galeria/bebes/bebes-10.jpg'

import paisajes01 from '../assets/galeria/paisajes/paisajes-01.jpg'
import paisajes02 from '../assets/galeria/paisajes/paisajes-02.jpg'
import paisajes03 from '../assets/galeria/paisajes/paisajes-03.jpg'
import paisajes04 from '../assets/galeria/paisajes/paisajes-04.jpg'
import paisajes05 from '../assets/galeria/paisajes/paisajes-05.jpg'
import paisajes06 from '../assets/galeria/paisajes/paisajes-06.jpg'
import paisajes07 from '../assets/galeria/paisajes/paisajes-07.jpg'
import paisajes08 from '../assets/galeria/paisajes/paisajes-08.jpg'
import paisajes09 from '../assets/galeria/paisajes/paisajes-09.jpg'
import paisajes10 from '../assets/galeria/paisajes/paisajes-10.jpg'

import bodas01 from '../assets/galeria/bodas/bodas-01.jpg'
import bodas02 from '../assets/galeria/bodas/bodas-02.jpg'
import bodas03 from '../assets/galeria/bodas/bodas-03.jpg'
import bodas04 from '../assets/galeria/bodas/bodas-04.jpg'
import bodas05 from '../assets/galeria/bodas/bodas-05.jpg'
import bodas06 from '../assets/galeria/bodas/bodas-06.jpg'
import bodas07 from '../assets/galeria/bodas/bodas-07.jpg'
import bodas08 from '../assets/galeria/bodas/bodas-08.jpg'
import bodas09 from '../assets/galeria/bodas/bodas-09.jpg'
import bodas10 from '../assets/galeria/bodas/bodas-10.jpg'

import infantiles01 from '../assets/galeria/infantiles/infantiles-01.jpg'
import infantiles02 from '../assets/galeria/infantiles/infantiles-02.jpg'
import infantiles03 from '../assets/galeria/infantiles/infantiles-03.jpg'
import infantiles04 from '../assets/galeria/infantiles/infantiles-04.jpg'
import infantiles05 from '../assets/galeria/infantiles/infantiles-05.jpg'
import infantiles06 from '../assets/galeria/infantiles/infantiles-06.jpg'
import infantiles07 from '../assets/galeria/infantiles/infantiles-07.jpg'
import infantiles08 from '../assets/galeria/infantiles/infantiles-08.jpg'
import infantiles09 from '../assets/galeria/infantiles/infantiles-09.jpg'
import infantiles10 from '../assets/galeria/infantiles/infantiles-10.jpg'

import embarazo01 from '../assets/galeria/embarazo/embarazo-01.jpg'
import embarazo02 from '../assets/galeria/embarazo/embarazo-02.jpg'
import embarazo03 from '../assets/galeria/embarazo/embarazo-03.jpg'
import embarazo04 from '../assets/galeria/embarazo/embarazo-04.jpg'
import embarazo05 from '../assets/galeria/embarazo/embarazo-05.jpg'
import embarazo06 from '../assets/galeria/embarazo/embarazo-06.jpg'
import embarazo07 from '../assets/galeria/embarazo/embarazo-07.jpg'
import embarazo08 from '../assets/galeria/embarazo/embarazo-08.jpg'
import embarazo09 from '../assets/galeria/embarazo/embarazo-09.jpg'
import embarazo10 from '../assets/galeria/embarazo/embarazo-10.jpg'

import bautismos01 from '../assets/galeria/bautismos/bautismos-01.jpg'
import bautismos02 from '../assets/galeria/bautismos/bautismos-02.jpg'
import bautismos03 from '../assets/galeria/bautismos/bautismos-03.jpg'
import bautismos04 from '../assets/galeria/bautismos/bautismos-04.jpg'
import bautismos05 from '../assets/galeria/bautismos/bautismos-05.jpg'
import bautismos06 from '../assets/galeria/bautismos/bautismos-06.jpg'
import bautismos07 from '../assets/galeria/bautismos/bautismos-07.jpg'
import bautismos08 from '../assets/galeria/bautismos/bautismos-08.jpg'
import bautismos09 from '../assets/galeria/bautismos/bautismos-09.jpg'
import bautismos10 from '../assets/galeria/bautismos/bautismos-10.jpg'

// Para agregar más fotos a una colección: copiá la imagen en
// src/assets/galeria/COLECCION/, importala arriba y sumala al array "fotos" correspondiente.
const bebes = [bebes01, bebes02, bebes03, bebes04, bebes05, bebes06, bebes07, bebes08, bebes09, bebes10]
const paisajes = [paisajes01, paisajes02, paisajes03, paisajes04, paisajes05, paisajes06, paisajes07, paisajes08, paisajes09, paisajes10]
const bodas = [bodas01, bodas02, bodas03, bodas04, bodas05, bodas06, bodas07, bodas08, bodas09, bodas10]
const infantiles = [infantiles01, infantiles02, infantiles03, infantiles04, infantiles05, infantiles06, infantiles07, infantiles08, infantiles09, infantiles10]
const embarazo = [embarazo01, embarazo02, embarazo03, embarazo04, embarazo05, embarazo06, embarazo07, embarazo08, embarazo09, embarazo10]
const bautismos = [bautismos01, bautismos02, bautismos03, bautismos04, bautismos05, bautismos06, bautismos07, bautismos08, bautismos09, bautismos10]

export const coleccionesGaleria = [
  { id: 'bebes', titulo: 'Bebés', portada: bebes[0], fotos: bebes },
  { id: 'paisajes', titulo: 'Paisajes', portada: paisajes[0], fotos: paisajes },
  { id: 'bodas', titulo: 'Bodas', portada: bodas[0], fotos: bodas },
  { id: 'infantiles', titulo: 'Infantiles', portada: infantiles[0], fotos: infantiles },
  { id: 'embarazo', titulo: 'Embarazo', portada: embarazo[0], fotos: embarazo },
  { id: 'bautismos', titulo: 'Bautismos', portada: bautismos[0], fotos: bautismos },
]