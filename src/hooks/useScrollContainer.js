import { useContext } from "react";
import { ScrollContainerContext } from "../components/HomePageLayout";

export default function useScrollContainer() {
  return useContext(ScrollContainerContext);
}
