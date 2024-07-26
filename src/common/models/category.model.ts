export type Category= {
  id: number;
  parent_id: number;
  title: string;
  slug: string;
  meta: any;
  mediaurls: { images: Array<any> };

  image: string;


}

// static getAllDefault(title: string, slug: string): Category {
//   let toReturn = new Category();
//   toReturn.title = title;
//   toReturn.id = 0;
//   toReturn.slug = slug;
//   return toReturn;
// }
