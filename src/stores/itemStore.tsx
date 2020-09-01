import { autorun, observable, action, computed, configure } from "mobx";

configure({ enforceActions: "always" });

class ItemStore {
  @observable itemList: any[] = [];
  @observable listError: any = "";

  rootStore: any;

  constructor(rootStore: any) {
    this.rootStore = rootStore;
    this.load();
    autorun(this.save);
  }

  @action addItems = (
    items: any,
    startDate: Date,
    endDate: Date,
    dbID: any
  ) => {
    console.log(startDate, endDate);
    //Check if an item with the same title is
    let itemCheck = this.itemList.find((item) => {
      return (
        item[0].Title === items.Title &&
        item[0].author === items.author &&
        Date.parse(item[2]) >= startDate.getTime()
      );
    });

    if (itemCheck) {
      this.listError = "duplicate item";
    } else {
      this.itemList.push([items, startDate, endDate, dbID]);
      this.listError = "none";
    }
  };

  @computed get getItems() {
    return Object.keys(this.itemList || {}).map((key: any) => ({
      ...this.itemList[key],
      uid: key,
    }));
  }

  private save = () =>
    window.localStorage.setItem(
      ItemStore.name,
      JSON.stringify({
        itemList: this.itemList,
      })
    );

  @action empty = () => {
    window.localStorage.removeItem(ItemStore.name);

    this.itemList.length = 0; //empty the array
  };

  @action removeItem = (index: number) => {
    this.itemList.splice(index, 1);
  };

  @action
  private load = () =>
    Object.assign(
      this,
      JSON.parse(window.localStorage.getItem(ItemStore.name) || "{}")
    );
}

export default ItemStore;
