
// FavSet is a support datastructure to handle favourite channels
// and persisting them to local storage.
export default class FavSet {
    _storageKey = '';
    _favs = new Set();

    // onchange is a lambda which is called when the export URL changes.
    onchange = (exportURL) => {};

    // The country is a string used to support different favourite
    // list per different countries.
    constructor(country) {
        this._storageKey = `favourites-channels-${country}`;
        this._fromStorage();
    }

    // Checks if a channel is a favourite.
    // The parameter must be a string, returns a bool.
    has(ch) {
      return this._favs.has(ch);
    }

    // Adds a channel to the favourite list.
    // Adding a channel already in the list is a no op.
    // The parameter must be a string, returns nothing.
    add(ch) {
        if ( this._favs.has (ch) )
            return;
        this._favs.add(ch);
        this._export();
    }

    // Deletes a channel from the favourites list.
    // Deleting a channel not in the list is a no op.
    // The parameter must be a string, returns nothing.
    delete(ch) {
        if ( !this._favs.has(ch) )
            return;
        this._favs.delete(ch);
        this._export();
    }

    // Imports the favourites list from a URL.
    // The URL must be produced by toURL().
    // Returns false if nothing got imported or the URL
    // without the import fragment on success.
    fromURL(urlStr) {
        try {
            const url = new URL(urlStr);
            const sp = new URLSearchParams(url.search);
            const toImport = sp.get('favs');
            if ( toImport ) {
                this._favs = new Set(toImport.split('-'));
                this._toStorage();
                sp.delete('favs');
                url.search = sp;
                return url.toString();
            }
        } catch (e) {
            console.error('cannot import favourites', e);
        }
        return false;
    }

    // Exports the list of favourites to a URL.
    // returns a string.
    toURL() {
      const ff = [...this._favs];
      ff.sort();
      const p = ff.join('-');
      const url = new URL(window.location);
      url.search = new URLSearchParams({favs: p});
      return url.toString();
    }

    _fromStorage() {
      try {
        const j = localStorage.getItem(this._storageKey);
        if ( j ) {
            this._favs = new Set(JSON.parse(j));
            return true;
        }
      } catch (e) {
        console.error('cannot read favourites', e);
      }
      return false;
    }

    _toStorage() {
      const favsStr = JSON.stringify([...this._favs]);
      localStorage.setItem(this._storageKey, favsStr);
    }

    _export() {
        this._toStorage();
        try {
            this.onchange(this.toURL());
        } catch(e) {
            log.error('error while calling onchange callback for favourites', e);
        }
    }
}
