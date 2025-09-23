// Generate random driver names
const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Taylor",
  "Casey",
  "Morgan",
  "Riley",
  "Avery",
  "Quinn",
  "Sam",
  "Blake",
  "Cameron",
  "Drew",
  "Emery",
  "Finley",
  "Harper",
  "Hayden",
  "Jamie",
  "Kendall",
  "Logan",
  "Marley",
  "Parker",
  "Peyton",
  "Reese",
  "Sage",
  "Skyler",
  "Tanner",
  "Teagan",
  "Tyler",
  "Wren",
  "Zion",
]

const LAST_NAMES = [
  "Anderson",
  "Brown",
  "Davis",
  "Garcia",
  "Johnson",
  "Jones",
  "Martinez",
  "Miller",
  "Moore",
  "Rodriguez",
  "Smith",
  "Taylor",
  "Thomas",
  "Thompson",
  "White",
  "Williams",
  "Wilson",
  "Clark",
  "Lewis",
  "Lee",
  "Walker",
  "Hall",
  "Allen",
  "Young",
  "King",
  "Wright",
  "Lopez",
  "Hill",
  "Scott",
  "Green",
]

export function generateDriverName(): { firstName: string; lastName: string } {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  return { firstName, lastName }
}

export function generateInitialsAvatar(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
}
