// Reader-facing magazine catalogue. Mirrors the dashboard mockups
// (design/User - home.png, design/user - magazines - *.png) until the
// magazines API is wired into the user-facing routes.
const USER_MAGAZINES = Array.from({ length: 8 }, (_, i) => ({
  id: `mag-${String(i + 1).padStart(3, "0")}`,
  title: "Magazines",
  description: "List of all the magazines you been looking for",
  image: null,
}));

export default USER_MAGAZINES;
