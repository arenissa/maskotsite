/**
 * Единственный файл для редактирования текстов, товаров и URL.
 * CHATBOT_URL оставьте пустым до утверждения действительного адреса.
 * Фото загружаются только при указании image (относительный путь или https URL).
 */
export const CONFIG = {
  CHATBOT_URL: 'https://n8n.areniss.ru/webhook/e5c6bb23-248c-477b-a7cd-de3d290fc1bc/chat',
  MASCOT_GLB_PATH: 'assets/mascot-procedural.glb', // Можно заменить на свою .glb-модель.

  CHATBOT_MODE: 'link', // 'link'; для iframe/API смотрите docs/CHATBOT.md
  STORY_HEADING: 'Привет! Я — твой Квадратный напарник.',
  STORY_SUB: 'Листай дальше, и ты узнаешь, как я стал тем, кто я есть.',
  STORY_TEXT: '', // Утверждённая история пока не предоставлена.
  CHAT_HEADING: 'Привет! Го пообщаемся',
  CHAT_PLACEHOLDER: 'Скоро здесь можно будет пообщаться.',
  MERCH: [
    { id: 'kruzhka',  title: 'кружка',              price: 690,  image: 'assets/merch/kruzhka.jpg' },
    { id: 'figura',   title: 'фигурка',             price: 1690, image: 'assets/merch/figura.jpg' },
    { id: 'kepka',    title: 'кепка',               price: 1290, image: 'assets/merch/kepka.jpg' },
    { id: 'futbolka', title: 'футболка',            price: 1990, image: 'assets/merch/futbolka.jpg' },
    { id: 'hudi',     title: 'худи',                price: 3990, image: 'assets/merch/hudi.jpg' },
    { id: 'svitshot', title: 'свитшот',             price: 3490, image: 'assets/merch/svitshot.jpg' },
    { id: 'shopper',  title: 'шоппер',              price: 890,  image: 'assets/merch/shopper.jpg' },
    { id: 'kovrik',   title: 'коврик для мыши',     price: 990,  image: 'assets/merch/kovrik.jpg' },
    { id: 'mikrofon', title: 'микрофон',            price: 2490, image: 'assets/merch/mikrofon.jpg' },
    { id: 'hdd',      title: 'внешний жёсткий диск', price: 4590, image: 'assets/merch/hdd.jpg' }
  ],
  ORDER: {
    SUCCESS_TEXT: 'Заказ принят! Ожидайте звонка — мы свяжемся с вами для подтверждения.',
    STORAGE_KEY: 'red-square-cart'
  },
  MOTION: {
    TRANSFORM_START: 0.055,
    TRANSFORM_END: 0.26,
    SPIN_START: 0.265,
    SPIN_END: 0.615,
    STORY_ENTER: 0.645,
    STORY_EXIT: 0.798,
    CHAT_ENTER: 0.803,
    CHAT_EXIT: 0.984
  }
};
