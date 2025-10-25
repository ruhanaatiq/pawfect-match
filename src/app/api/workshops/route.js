// src/app/api/workshops/route.js

export async function GET() {
  const workshopsData = [
    {
      id: 1,
      title: "Basic Pet Training",
      date: "2025-10-20T15:00:00",
      bgImage: "/training.jpg",
    },
    {
      id: 2,
      title: "Healthy Pet Nutrition",
      date: "2025-10-25T14:00:00",
      bgImage: "/nutrition.jpg",
    },
    {
      id: 3,
      title: "Pet First Aid & Emergency Care",
      date: "2025-10-28T16:00:00",
      bgImage: "/firstaid.webp",
    },
    {
      id: 4,
      title: "Grooming & Hygiene",
      date: "2025-11-02T13:30:00",
      bgImage: "/grooming.webp",
    },
  ];

  return new Response(JSON.stringify(workshopsData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
