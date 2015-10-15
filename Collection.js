import Immutable from "immutable";

export class Collection extends Map {
  //todo : mettre un compteur lors de l'initialisation de la map
  constructor() {
    super();
    // on initialise un compteur à 0 lors de l'init de la Collection
    this.__counter = 0;
  }

  add(v) {
    // on check que l'élément accepte les __cid
    if(v.has("__cid")) {
      // si le cid est null et que  la clef avec le __cid n'existe pas
      if(v.get("__cid") === null && !this.has(v.get("__cid"))) {
        // on sette le cid en fonction de la valeur du compteur
        this.counter = this.counter+1;
        v=v.set("__cid", "c"+this.counter;
        // ensuite sette v avec le __cid
        this.set(v.get("__cid"), v)
      }
    } else {
      throw new Error("Model invalid, does not support __cid");
    }
  }
}
