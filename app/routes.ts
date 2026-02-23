import {type RouteConfig, index, route} from "@react-router/dev/routes";
//11:00
export default [
    index("routes/home.tsx"),
    route('visualizer/:id', './routes/visualizer.$id.tsx') //1:00:00  Add this new route within  app/routes.ts
    //its gonna be a dynamic route
] satisfies RouteConfig;
