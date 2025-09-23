// src/app/adopt/page.jsx
import PetsGrid from "./ui/PetsGrid";
import Filters from "./ui/Filters";
import Toolbar from "./ui/Toolbar";

// mock fetch — replace with your real API/db
async function getPets(searchParams) {
  const {
    q = "",
    species = "",
    breed = "",
    age = "",
    size = "",
    gender = "",
    good = "",
    vax = "",
    spay = "",
    sort = "recent",
    view = "grid",
    page = "1",
    loc = "",
    radius = "25",
  } = searchParams;

  return {
    total: 132,
    page: Number(page),
    pageSize: 12,
    items: Array.from({ length: 12 }, (_, i) => ({
      id: `pet-${page}-${i}`,
      name: ["Milo", "Bella", "Max", "Luna", "Charlie", "Coco"][i % 6],
      species: species || ["dog", "cat", "rabbit"][i % 3],
      breed: breed || ["Spitz", "Tabby", "Mixed"][i % 3],
      age: ["Puppy", "Adult", "Senior"][i % 3],
      gender: ["Male", "Female"][i % 2],
      size: ["Small", "Medium", "Large"][i % 3],
      distanceKm: [2, 6, 10, 12, 18, 25][i % 6],
      image: ["/spitz.jpg", "/pets-hero.png", "/why-dog.png"][i % 3],
      tags: ["Vaccinated", "House-trained", "Good with kids"].slice(0, (i % 3) + 1),
      shelter: ["Happy Paws Shelter", "City Rescue", "Purr & Fur"][i % 3],
    })),
  };
}

export default async function AdoptPage({ searchParams }) {
  const data = await getPets(searchParams);

  // derive total pages
  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <main className="py-8 ">
      <div className=" mx-auto max-w-6xl px-6">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#4C3D3D]">Adopt a Friend</h1>
          <p className="text-[#4C3D3D]/70">
            Browse pets from verified shelters and fosters.
          </p>
        </header>

        {/* toolbar: results count, sort, view toggle, mobile filters button */}
        <Toolbar total={data.total} />

        {/* horizontal filters */}
        <div className="mt-8 mb-8">
          <Filters />
        </div>

        {/* results grid with pagination */}
        <PetsGrid
          data={data}
          currentPage={data.page}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
}
