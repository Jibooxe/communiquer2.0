
export interface TCFBooklet {
  id: string;
  number: number;
  title: string;
  intro: string;
  pages: {
    title: string;
    sections: {
      title: string;
      description?: string;
      items: {
        id: string;
        text: string;
        options: string[];
      }[];
    }[];
  }[];
}

export const TCF_DATA: TCFBooklet[] = [
  {
    id: "livret-1",
    number: 1,
    title: "Livret d'entrainement n°1",
    intro: "Les items de ce test ont été sélectionnés pour vous permettre de vous familiariser avec les questions proposées dans les sessions du TCF.",
    pages: []
  },
  {
    id: "livret-8",
    number: 8,
    title: "Livret d'entrainement n°8",
    intro: "Les items de ce test ont été sélectionnés pour vous permettre de vous familiariser avec les questions proposées dans les sessions du TCF. Ces items ont été conçus et validés linguistiquement et pédagogiquement.",
    pages: [
      {
        title: "COMPRÉHENSION ORALE",
        sections: [
          {
            title: "Question 5 à 11",
            description: "Écoutez le document sonore et la question. Choisissez la bonne réponse.",
            items: [
              { id: "5", text: "Il apprécie ses nouveaux collègues. / Il espère une promotion rapide. / Il gagne plus d'argent qu'avant. / Il préfère son ancien poste.", options: ["A", "B", "C", "D"] }
            ]
          }
        ]
      }
    ]
  }
];
