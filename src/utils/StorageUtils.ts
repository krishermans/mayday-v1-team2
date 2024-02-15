import SubCategory from "../types/SubCategory";
import Category from "../types/Category";
import { isCategory, isSubCategory } from "../types/IsType";
import { getRandomUuid } from "./UuidUtils";
import { StorageKeys } from "./StorageUtils.types";
import PersistStrategy from "../patterns/strategy/PersistStrategy";


const equals = (a: Category | SubCategory, b: Category | SubCategory) => {
  if (isCategory(a) && isCategory(b)) {
    return a.id === b.id
      && a.title === b.title
      && a.colour === b.colour
      && a.code === b.code
      && arrayEquals(a.subCategories, b.subCategories);
  }
  else if (isSubCategory(a) && isSubCategory(b)) {
    return a.id === b.id
    && a.categoryId === b.categoryId
      && a.description === b.description;
  }

  return false;
}

const arrayEquals = (a: Category[] | SubCategory[], b: Category[] | SubCategory[]) => {
  if (a?.length !== b?.length) {
    return false;
  }

  for (let i = 0; i < a?.length; ++i) {
    if (!equals(a[i], b[i])) {
      return false;
    }
  }

  return true;
}

export const write = (key: string, value: any) => {
  let value1 = JSON.stringify(value);
  localStorage.setItem(key, value1);
}

export const save = (key: string, value: any) => {
  const parsed = JSON.parse(localStorage.getItem(key));
  if (!parsed || (parsed && !parsed.find((item: Category | SubCategory) => equals(item, value)))) {
    value.id = !value.id ? getRandomUuid() : value.id;
    write(key, [...(parsed ? parsed : []), value]);
  }
}

export const getAll = (key: string) => {
  const items = localStorage.getItem(key);

  return items !== null ? JSON.parse(items) : [];
}

export const getById = (key: string, id: string) => {
  const items = getAll(key);

  return items.find((item: Category | SubCategory) => item.id === id);
}

export const update = (key: string, id: string, value: any) => {
  const updated = getAll(key).map((item: Category | SubCategory) => {
    if (item.id === id) {
      return {
        ...item,
        ...value
      };
    }

    return item;
  });

  write(key, updated);
}

export const deleteById = (key: string, id: string) => {
  let all = getAll(key);
  const updated = all.filter((item: Category | SubCategory) => item.id !== id);

  if (!arrayEquals(all, updated)) {
    write(key, updated);
  }
}
export const loadInitialStorage = (data: { categories: Category[], subCategories: SubCategory[] }) => {
  const initialCategories = getAll(StorageKeys.CATEGORY);
  if (!initialCategories || initialCategories.length === 0) {
    data.categories.forEach(category => {
      save(StorageKeys.CATEGORY, category);
    });
  }

  const initialSubCategories = getAll(StorageKeys.SUBCATEGORY);
  if (!initialSubCategories || initialSubCategories.length === 0) {
    data.subCategories.forEach(subCategory => {
      save(StorageKeys.SUBCATEGORY, subCategory);
    });
  }
};

export class StoragePersistStrategy implements PersistStrategy {

  save(key: string, value: any): void {
    save(key, value);
  }

  getAll(key: string): any {
    return getAll(key);
  }

  getById(key: string, id: string): any {
    return getById(key, id);
  }

  update(key: string, id: string, value: any): void {
    update(key, id, value);
  }

  deleteById(key: string, id: string): void {
    deleteById(key, id);
  }

  loadInitialStorage(data: { categories: Category[], subCategories: SubCategory[] }): void {
    loadInitialStorage(data);
  }

}


export class FetchPersistStrategy implements PersistStrategy {

  async save(key: string, value: any) {
    const response = await fetch(`http://localhost:3000/${key}`, {
      body: JSON.stringify(value),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      throw new Error("Failed to save");
    }
  }

  async getAll(key: string) {
    const response = await fetch(`http://localhost:3000/${key}`);

    if (!response.ok) {
      throw new Error("Failed to get");
    }

    return response.json();
  }

  async getById(key: string, id: string) {
    const response = await fetch(`http://localhost:3000/${key}/${id}`);

    if (!response.ok) {
      throw new Error("Failed to get by id");
    }

    return response.json();
  }

  async update(key: string, id: string, value: any) {
    const response = await fetch(`http://localhost:3000/${key}/${id}`, {
      body: JSON.stringify(value),
      headers: {
        "Content-Type": "application/json"
      },
      method: "PUT"
    });

    if (!response.ok) {
      throw new Error("Failed to update");
    }
  }

  async deleteById(key: string, id: string) {
    const response = await fetch(`http://localhost:3000/${key}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete");
    }
  }

  async loadInitialStorage(data: { categories: Category[], subCategories: SubCategory[] }) {
    for (const category of data.categories) {
      await this.save(StorageKeys.CATEGORY, category);
    }

    for (const subCategory of data.subCategories) {
      await this.save(StorageKeys.SUBCATEGORY, subCategory);
    }
  }

}
