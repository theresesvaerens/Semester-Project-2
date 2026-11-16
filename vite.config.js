import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const p = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: p("./index.html"),
        login: p("./pages/login.html"),
        register: p("./pages/register.html"),
        listing: p("./pages/listing.html"),
        listingCreate: p("./pages/listing-create.html"),
        listingEdit: p("./pages/listing-edit.html"),
        profile: p("./pages/profile.html"),
      },
    },
  },
});
