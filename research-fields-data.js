"use strict";

// Field associations follow the site owner's supplied classifications.
// U2, D5, D4, D3, D2 and D1 are retained but excluded from popups at the owner's request.
window.researchFieldsData = {
  fields: [
    {
      id: "user-centered",
      title: "User-Centered Design",
      description: "Designing around people's needs and tasks, then testing and refining ideas with users throughout the process.",
      references: [
        {
          authors: "John D. Gould and Clayton Lewis",
          year: 1985,
          title: "Designing for usability: Key principles and what designers think",
          venue: "Communications of the ACM, 28(3), 300–311",
          url: "https://research.ibm.com/publications/designing-for-usability-key-principles-and-what-designers-think--1"
        }
      ],
      publications: ["U4", "U1", "C2", "C1", "W1", "D8", "D7"]
    },
    {
      id: "interactive-systems",
      title: "Design and Evaluation of Interactive Systems",
      description: "Designing systems people can interact with, then evaluating how usable, functional, and acceptable they are. Evaluation can involve users, expert review, or models.",
      references: [
        {
          authors: "Alan Dix, Janet Finlay, Gregory Abowd, and Russell Beale",
          year: 2004,
          title: "Human-Computer Interaction (3rd ed.)",
          venue: "Prentice Hall, Chapters 5 and 9",
          url: "https://www.hcibook.com/e3/"
        }
      ],
      publications: ["U4", "C3", "C2", "C1", "W1", "D7"]
    },
    {
      id: "computational",
      title: "Computational Interaction",
      description: "Using algorithms and computational models to explain how people interact with technology and to guide the design or adaptation of interfaces.",
      references: [
        {
          authors: "Xiaojun Bi, Andrew Howes, Per Ola Kristensson, Antti Oulasvirta, and John Williamson",
          year: 2018,
          title: "Introduction",
          venue: "Computational Interaction, Oxford University Press, 1–14",
          url: "https://academic.oup.com/book/34845/chapter/297819739"
        }
      ],
      publications: ["U3", "U1", "C1"]
    },
    {
      id: "embodied",
      title: "Embodied Activities and Learning",
      description: "Studying how bodily action and engagement with the world shape interaction and learning. For learning, both bodily involvement and its connection to the task matter.",
      references: [
        {
          authors: "Paul Dourish",
          year: 2001,
          title: "Where the Action Is: The Foundations of Embodied Interaction",
          venue: "The MIT Press",
          url: "https://mitpress.mit.edu/9780262041966/where-the-action-is/"
        },
        {
          authors: "Alexander Skulmowski and Günter Daniel Rey",
          year: 2018,
          title: "Embodied learning: introducing a taxonomy based on bodily engagement and task integration",
          venue: "Cognitive Research: Principles and Implications, 3, Article 6",
          url: "https://link.springer.com/article/10.1186/s41235-018-0092-9"
        }
      ],
      publications: ["U3", "U1", "C3", "C1", "W1", "D6"]
    }
  ],
  publications: [
    {
      code: "U4",
      title: "Gaze-Gesture Multimodal Interaction",
      authors: "Gangtae Park, Juyoung Lee, Hyunyoung Han, Jieun Han, Ian Oakley",
      venue: "",
      year: null,
      status: "Under review",
      href: "publications.html#publication-u4"
    },
    {
      code: "U3",
      title: "Externalization of Tacit Knowledge",
      authors: "Hyunyoung Han, Jieyeon Woo, Mingyu Han, Ammar Al-Taie, John H Williamson, Roderick Murray-Smith, Ian Oakley",
      venue: "",
      year: null,
      status: "Under review",
      href: "publications.html#publication-u3"
    },
    {
      code: "U2",
      title: "AmbientEye: A Dataset for Pupil Segmentation under Natural Ambient Infrared Illumination",
      authors: "Mingyu Han, Hyunyoung Han, Nitheekulawatn Thommakoon, Gangtae Park, Jieun Han, Xucong Zhang, Ian Oakley",
      venue: "",
      year: 2026,
      status: "Under review",
      preprint: "https://arxiv.org/abs/2606.03774",
      href: "#publication-u2"
    },
    {
      code: "U1",
      title: "Make it Simple, Make it Dance: Dance Motion Simplification to Support Novices’ Dance Learning",
      authors: "Hyunyoung Han, Murad Eynizada, Son Xuan Nghiem, Sang Ho Yoon",
      venue: "",
      year: 2026,
      status: "Under review",
      preprint: "https://doi.org/10.48550/arXiv.2604.10490",
      href: "#publication-u1"
    },
    {
      code: "C3",
      title: "Hit and Run: Evaluating Interface Placements for Automated Vehicle-Runner Interaction",
      authors: "Ammar-Al Taie, Hyunyoung Han, Mingyu Han, Ian Oakley",
      venue: "ACM AutomotiveUI",
      year: 2026,
      status: "Published",
      href: "#publication-c3"
    },
    {
      code: "C2",
      title: "ComiXR: Exploring Comic Layouts in eXtended Reality",
      authors: "Ammar Al-Taie, Hyunyoung Han, Ian Oakley",
      venue: "ACM DIS",
      year: 2026,
      status: "Published",
      href: "#publication-c2"
    },
    {
      code: "C1",
      title: "ChoreoCraft: In-situ Crafting of Choreography in Virtual Reality through Creativity Support Tool",
      authors: "Hyunyoung Han*, Kyungeun Jung*, Sang Ho Yoon",
      venue: "ACM CHI",
      year: 2025,
      award: "Honorable Mention (Top 5%)",
      status: "Published",
      href: "#publication-c1"
    },
    {
      code: "W1",
      title: "AfforDance: Personalized AR Dance Learning System with Visual Affordance",
      authors: "Hyunyoung Han, Jongwon Jang, Kitaeg Shim, Sang Ho Yoon",
      venue: "ACM CHI Workshop",
      year: 2025,
      status: "Published",
      href: "publications.html#publication-w1"
    },
    {
      code: "D8",
      title: "One-Fingering-Fits-All? Adaptive Piano Fingering Estimation Based on Various Hand Sizes",
      authors: "Hyunyoung Han*, Mingyu Han*, Gangtae Park*, Ian Oakley, Juhan Nam",
      venue: "HCI Korea",
      year: 2026,
      status: "Published",
      href: "publications.html#publication-d8"
    },
    {
      code: "D7",
      title: "ChaMEleon: Identity-Adjustable Remote Collaboration System in Virtual Reality",
      authors: "Hyunyoung Han, Haejun Kim, Junseo Lee, Woontack Woo",
      venue: "HCI Korea",
      year: 2025,
      status: "Published",
      href: "publications.html#publication-d7"
    },
    {
      code: "D6",
      title: "Step-by-Step: Dance Step Learning for Novices Through Foot Movement Visualization in VR",
      authors: "Murad Eynizada, Hyunyoung Han, Sang Ho Yoon",
      venue: "HCI Korea",
      year: 2025,
      status: "Published",
      href: "publications.html#publication-d6"
    },
    {
      code: "D5",
      title: "Zooblox: Gen-AI Augmented Block Toy Experience for Children",
      authors: "Kirak Kim*, Hyunwoo Kim*, Hyojin Kim*, Hyunyoung Han*, Jaehong Ahn",
      venue: "HCI Korea",
      year: 2025,
      status: "Published",
      href: "publications.html#publication-d5"
    },
    {
      code: "D4",
      title: "AfforDance: Creating Dance Learning Content Tailored to User Preference and Providing Effective Learning Experiences Utilizing Affordance in Augmented Reality",
      authors: "Hyunyoung Han, Jongwon Jang, Kitaeg Shim, Hyuckjin Jang, Youjin Sung, Min-yung Kim, Sang Ho Yoon",
      venue: "Korea Computer Congress",
      year: 2024,
      status: "Published",
      href: "publications.html#publication-d4"
    },
    {
      code: "D3",
      title: "Exploratory study on dance motion guidance adapted dynamic time warping algorithm and haptic feedback system based on low-latency motion similarity comparison",
      authors: "Hyunyoung Han, Kyungeun Jung, Hojin Lee, Sang Ho Yoon",
      venue: "Korea Haptics Conference",
      year: 2023,
      status: "Published",
      href: "publications.html#publication-d3"
    },
    {
      code: "D2",
      title: "Lightening of the high-performance Pose Estimation model in the video using Pointwise Similarity",
      authors: "Jaehyun Pahk*, Hyunwoo Kwak*, Hyunyoung Han*, Junkwang Kim, Wooyoung Jung",
      venue: "IEMEK Autumn Conference",
      year: 2021,
      status: "Published",
      href: "publications.html#publication-d2"
    },
    {
      code: "D1",
      title: "Person Re-Identification and Tracking Algorithm in Mobile Environment for Human-Robot Interaction",
      authors: "Hyunyoung Han*, Jaehyun Pahk*, Doowon Choe*, Junkwang Kim, Wooyoung Jung",
      venue: "16th IEMEK Symposium on Embedded Technology",
      year: 2021,
      status: "Published",
      href: "publications.html#publication-d1"
    }
  ]
};
