export type MyAddress= {
  id: number;
  user_id?: number;
  title: string;
  formatted_address: string;
  latitude: string;
  longitude: string;

}
export function getDemoAddress(): MyAddress {
    let toReturn:MyAddress ={
      id: -1,
      formatted_address: "New York",
      latitude: "40.6971494",
      longitude: "-74.2598655",
      user_id: 0,
      title: "New York"
    };
    return toReturn
}
