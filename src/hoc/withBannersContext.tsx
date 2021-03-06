import React from "react";
import { BannerContextProvider } from "context/banners";

export const withBannersContext = <T extends unknown>(
  Component: React.ComponentType<T>
) => (props: T) => (
  <BannerContextProvider>
    <Component {...props} />
  </BannerContextProvider>
);
