/**
 * A crappy singleton.
 */
class IdManager {
  private _nextId: number = 0;
  private static _instance: IdManager;
  private constructor() {}

  static get instance(): IdManager {
    return this._instance || (this._instance = new IdManager());
  }

  getNewId(): number {
    return this._nextId++;
  }
}

export const idManager = IdManager.instance;
