/**
 * Text for the MindMaze puzzle site (/puzzles), in English and Mongolian.
 *
 * The keys started as the prototype's `data-i` keys (reference/index.html); the EDU section,
 * the EDU nav link and the Copy button have their own keys on top. Both dictionaries share
 * one key set (`Dict = Record<TKey, string>`), so a missing translation is a compile error.
 */
export type Lang = 'en' | 'mn';

const EN = {
  // nav
  nav_puzzles: 'puzzles',
  nav_why: 'games',
  nav_edu: 'edu',
  nav_impact: 'impact',
  contact: 'Contact',

  // hero
  e2: '01 — Traditional puzzles',
  h1a: 'Think in',
  h1b: 'moves.',
  l1: 'MindMaze teaches children to think through hands-on puzzles: wooden puzzles, logic grids and strategy games that reward patience.',
  hint: 'Scroll to assemble · drag to turn',

  // games
  e3: '02 — Mongolian puzzles',
  g_a: 'Games our',
  g_b: 'ancestors played.',
  g_l: 'Carved from wood and bone, Mongolian puzzles lock, interlock and untangle — tests of logic, patience and dexterity.',
  tag_int: 'Interlocking',
  tag_dis: 'Disentangling',
  g0t: 'Star puzzle',
  g0s: 'Six-piece star burr',
  g1t: 'Cross puzzle',
  g1s: 'Six-piece burr',
  g2t: 'Cross lock',
  g2s: 'Three-piece burr',
  g3t: 'Oyun tulkhuur',
  g3s: 'Ring puzzle',
  g4t: 'Uran beriin gogtsoo',
  g4s: 'Bone, knucklebone & string puzzle',
  g5t: 'Snowflake puzzle',
  g5s: 'Interlocking burr',

  // schools
  e4: '03 — Schools',
  h4a: 'Curriculum adopted',
  h4b: 'in 3 schools.',
  sc0: '21st Secondary School of Ulaanbaatar',
  sc1: '24th Secondary School of Ulaanbaatar',
  sc2: '1st Secondary School of Uvurkhangai',
  ns_h: 'Next partner schools',
  ns0: '1st School of Erdenet',
  ns1: '2nd School of Uvurkhangai',
  ns2: '1st School of Kherlen sum',
  ns3: '3rd School of Arkhangai',

  // moments
  m_e: 'MindMaze in class',
  m_a: 'Moments from',
  m_b: 'the classroom.',
  m_l: 'Snapshots from MindMaze sessions across our partner schools, where children and mentors solve traditional puzzles side by side.',
  m_label: 'Photos from MindMaze classroom sessions',
  m_keys: 'Photo slider: use the left and right arrow keys',
  m_prev: 'Previous photo',
  m_next: 'Next photo',
  m_of: '{n} of {total}',
  mp16: 'Three students hold a wooden snowflake puzzle together in their hands',
  mp9: 'A mentor holds up a bone-and-string puzzle in front of a painted space mural',
  mp1: 'A MindMaze mentor talks to a class of students at their desks',
  mp10: 'A child holds up a wooden snowflake puzzle in class',
  mp13: 'A mentor shows a girl how the star puzzle pieces fit',
  mp3: 'A mentor kneels beside a girl as she tries a wooden puzzle',
  mp18: 'Children crowd around a mentor showing the bone-and-string puzzle',
  mp11: 'Three students work together on a wooden star puzzle',
  mp5: 'A boy holds up a small wooden puzzle he is solving',
  mp14: 'A mentor and a young girl each twist a wooden snake puzzle',
  mp7: 'Three students hold up the wooden puzzles they solved',
  mp12: 'Two girls fit the pieces of a wooden star puzzle together',
  mp15: 'A mentor demonstrates the bone-and-string puzzle to a class',
  mp2: 'Students and a mentor working on puzzles together at a desk',
  mp20: 'A mentor and a girl solve a wooden snowflake puzzle together',
  mp6: 'A girl works on a wooden puzzle at her desk while classmates look on',
  mp17: 'Three mentors help students with wooden snake puzzles at their desks',
  mp4: 'A mentor helps a group of students with their puzzle sheets',
  mp19: 'A mentor helps a young girl with a wooden puzzle in the school hallway',
  mp8: 'A full classroom of students during a MindMaze session',

  // edu
  edu_k: 'MindMaze EDU',
  edu_a: 'Puzzles in the',
  edu_b: 'classroom',
  edu_i: 'We bring traditional Mongolian puzzles into the school day: short, hands-on sessions where children slow down, test ideas and explain their thinking. Here is how a program works and what we are measuring.',
  edu_g: 'At a glance',
  gk0: 'Where',
  gv0: '5 aimags · 12 schools',
  gk1: 'Reach',
  gv1: '840+ children',
  gk2: 'Format',
  gv2: 'In-class sessions during the school day',
  gk3: 'Grades',
  gv3: '3rd and 4th graders',
  gk4: 'Puzzles',
  gv4: '6 traditional puzzles',
  gk5: 'Team',
  gv5: '11 mentors & volunteers',
  edu_s: 'Impact so far',
  edu_n: 'Early estimates from our first sessions. Full survey results from students and teachers are coming soon.',
  st0: 'solved a puzzle on their own',
  st1: 'focus longer in class, say teachers',
  st2: 'want another session',

  // impact
  h5a: 'What a puzzle',
  h5b: 'leaves behind.',
  s1: 'Focus',
  s2: 'Spatial reasoning',
  s3: 'Persistence',
  s4: 'Planning ahead',
  s5: 'Fine motor skills',
  s6: 'Confidence',

  // footer
  fa: 'Ready for the',
  fb: 'first piece?',
  fc: 'Write to us',
  copy: 'Copy',
  copied: 'Copied',
  copy_sel: 'Selected',
} as const;

export type TKey = keyof typeof EN;
export type Dict = Record<TKey, string>;

const MN: Dict = {
  // nav
  nav_puzzles: 'Оньсого',
  nav_why: 'Тоглоом',
  nav_edu: 'Сургалт',
  nav_impact: 'Үр нөлөө',
  contact: 'Холбоо барих',

  // hero
  e2: '01 — Уламжлалт оньсого',
  h1a: 'Алхам бүрээ',
  h1b: 'бодож хий.',
  l1: 'MindMaze хүүхдүүдийг модон оньсого, логик даалгавар, стратегийн тоглоомоор дамжуулан бие даан сэтгэж сургадаг.',
  hint: 'Гүйлгээд угсар · чирээд эргүүл',

  // games
  e3: '02 — Монгол оньсон тоглоом',
  g_a: 'Өвөг дээдсийн',
  g_b: 'өв тоглоом.',
  g_l: 'Мод, ясаар урласан монгол оньсон тоглоомыг угсарч, задалж, ээдрээг нь тайлдаг. Эдгээр нь сэтгэн бодох чадвар, тэвчээр, гарын ур дүйг сорьдог.',
  tag_int: 'Угсардаг',
  tag_dis: 'Салгадаг',
  g0t: 'Од оньс',
  g0s: 'Зургаан модоор угсардаг од',
  g1t: 'Зургаан модны оньс',
  g1s: 'Зургаан модоор угсардаг тоглоом',
  g2t: 'Гурван модны оньс',
  g2s: 'Гурван мод хоорондоо түгжигддэг',
  g3t: 'Оюун түлхүүр',
  g3s: 'Цагариг чөлөөлөх тоглоом',
  g4t: 'Уран бэрийн гогцоо',
  g4s: 'Яс, шагай, утсан ээдрээ',
  g5t: 'Цасан ширхэг',
  g5s: 'Олон модоор угсардаг оньс',

  // schools
  e4: '03 — Сургуулиуд',
  h4a: 'Хөтөлбөр маань',
  h4b: '3 сургуульд хэрэгжиж байна.',
  sc0: 'Улаанбаатар хотын 21-р сургууль',
  sc1: 'Улаанбаатар хотын 24-р сургууль',
  sc2: 'Өвөрхангай аймгийн 1-р сургууль',
  ns_h: 'Удахгүй нэгдэх сургуулиуд',
  ns0: 'Эрдэнэт хотын 1-р сургууль',
  ns1: 'Өвөрхангай аймгийн 2-р сургууль',
  ns2: 'Хэрлэн сумын 1-р сургууль',
  ns3: 'Архангай аймгийн 3-р сургууль',

  // moments
  m_e: 'MindMaze ангид',
  m_a: 'Хичээлийн үеэр',
  m_b: 'буулгасан агшнууд.',
  m_l: 'Хамтран ажиллаж буй сургуулиудад хийсэн MindMaze хичээлүүдээс авсан зургууд.',
  m_label: 'MindMaze-ийн хичээлийн үеийн зургууд',
  m_keys: 'Зургийн гулсуур: зүүн, баруун сумаар шилжинэ',
  m_prev: 'Өмнөх зураг',
  m_next: 'Дараах зураг',
  m_of: '{total}-ийн {n}',
  mp16: 'Гурван сурагч модон цасан ширхэг оньсогыг гартаа хамтдаа барьж байна',
  mp9: 'Ментор сансрын ханын зургийн өмнө яс, утастай оньсого өргөн барьж байна',
  mp1: 'MindMaze-ийн ментор ширээндээ суугаа ангийн сурагчидтай ярилцаж байна',
  mp10: 'Хүүхэд ангидаа модон цасан ширхэг оньсого өргөн барьж байна',
  mp13: 'Ментор охинд одон оньсогын хэсгүүд хэрхэн нийлдгийг үзүүлж байна',
  mp3: 'Охиныг модон оньсого оролдож байхад ментор хажууд нь өвдөг сөгдөн сууж байна',
  mp18: 'Хүүхдүүд яс, утастай оньсого үзүүлж буй менторыг тойрон бөөгнөрчээ',
  mp11: 'Гурван сурагч модон одон оньсогыг хамтдаа тайлж байна',
  mp5: 'Хүү тайлж буй жижиг модон оньсогоо өргөн барьж байна',
  mp14: 'Ментор, бяцхан охин хоёр модон могой оньсого мушгиж байна',
  mp7: 'Гурван сурагч тайлсан модон оньсогоо өргөн үзүүлж байна',
  mp12: 'Хоёр охин модон одон оньсогын хэсгүүдийг нийлүүлж байна',
  mp15: 'Ментор ангийнхандаа яс, утастай оньсогыг үзүүлж байна',
  mp2: 'Сурагчид ментортойгоо ширээн дээр хамтдаа оньсого тайлж байна',
  mp20: 'Ментор, охин хоёр модон цасан ширхэг оньсогыг хамтдаа тайлж байна',
  mp6: 'Охин ширээн дээрээ модон оньсого тайлж, ангийнхан нь ажиглаж байна',
  mp17: 'Гурван ментор сурагчдад ширээн дээр нь модон могой оньсого тайлахад тусалж байна',
  mp4: 'Ментор хэсэг сурагчдад оньсогын хуудсаа бөглөхөд тусалж байна',
  mp19: 'Ментор сургуулийн коридорт бяцхан охинд модон оньсого тайлахад тусалж байна',
  mp8: 'MindMaze-ийн хичээлийн үеэр сурагчдаар дүүрэн анги',

  // edu
  edu_k: 'MindMaze EDU',
  edu_a: 'Хичээлд орсон',
  edu_b: 'оньс',
  edu_i: 'Бид уламжлалт монгол оньсыг хичээлийн цагт авчирдаг. Богино хугацааны дадлагын үеэр хүүхдүүд яаралгүй бодож, санаагаа туршиж, хэрхэн шийдсэнээ тайлбарлаж сурдаг. Хөтөлбөр маань хэрхэн явагддаг, бид юуг хэмжиж байгааг доор харуулав.',
  edu_g: 'Товч танилцуулга',
  gk0: 'Хаана',
  gv0: '5 аймаг · 12 сургууль',
  gk1: 'Хамрах хүрээ',
  gv1: '840 гаруй хүүхэд',
  gk2: 'Хэлбэр',
  gv2: 'Хичээлийн цагаар ангид явагдана',
  gk3: 'Анги',
  gv3: '3, 4-р ангийн сурагчид',
  gk4: 'Оньс',
  gv4: '6 төрлийн уламжлалт оньс',
  gk5: 'Баг',
  gv5: '11 ментор, сайн дурын ажилтан',
  edu_s: 'Одоогийн үр дүн',
  edu_n: 'Эхний хичээлүүдийн урьдчилсан дүн. Сурагч, багш нараас авсан судалгааны бүрэн дүнг удахгүй нийтэлнэ.',
  st0: 'оньсийг бие даан тайлсан',
  st1: 'хичээл дээр анхаарал нь сайжирсан гэж багш нар үзсэн',
  st2: 'дахин хичээлд суухыг хүссэн',

  // impact
  h5a: 'Оньсон тоглоом',
  h5b: 'ямар ач тустай вэ?',
  s1: 'Анхаарал төвлөрөл',
  s2: 'Орон зайн сэтгэлгээ',
  s3: 'Тэвчээр',
  s4: 'Урьдчилан төлөвлөх',
  s5: 'Гарын нарийн хөдөлгөөн',
  s6: 'Өөртөө итгэх итгэл',

  // footer
  fa: 'Та',
  fb: 'бэлэн үү?',
  fc: 'Бидэнтэй холбогдоорой',
  copy: 'Хуулах',
  copied: 'Хуулагдлаа',
  copy_sel: 'Сонгогдлоо', // not in the supplied list: shown only when the clipboard is unavailable
};

export const DICTS: Record<Lang, Dict> = { en: EN, mn: MN };

export const LANG_STORAGE_KEY = 'mm-lang';
