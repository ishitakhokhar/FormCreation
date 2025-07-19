import Index from "views/Index.js";
import Register from "views/examples/Register.js";
import Login from "views/examples/Login.js";
import FormBuilder from "views/examples/FormBuilder.js";
import SubmissionsView from "views/examples/SubmissionsView.js";
import FormViewer from "views/examples/FormViewer.js";
import Profile from "views/examples/Profile.js";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
  {
    path: "/builder/:formId",
    component: <FormBuilder />,
    layout: "/admin",
  },
  {
    path: "/submissions/:formId",
    component: <SubmissionsView />,
    layout: "/admin",
  },
  {
    path: "/form/:formId",
    component: <FormViewer />,
    layout: "/form",
  },
  {
    path: "/login",
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/register",
    component: <Register />,
    layout: "/auth",
  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <Profile />,
    layout: "/admin",
  },
];

export default routes;
