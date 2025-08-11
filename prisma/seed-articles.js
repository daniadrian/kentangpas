const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const articles = [
    {
      title: "Cara Mengatasi Serangan Hama pada Kentang",
      slug: "cara-mengatasi-serangan-hama-pada-kentang",
      bannerUrl: "/images/articleimage1.jpg",
      author: "Pak Tani",
      publishedAt: new Date("2025-08-10T08:00:00Z"),
      articleContent: `<p>Serangan hama pada tanaman kentang merupakan salah satu tantangan utama yang dapat mengurangi kualitas dan kuantitas hasil panen secara signifikan. Hama seperti kutu daun, ulat grayak, dan kumbang daun sering menyerang tanaman kentang pada berbagai tahap pertumbuhan sehingga perlu penanganan yang tepat dan cepat. Untuk mengatasi hal ini, petani dapat melakukan identifikasi jenis hama yang menyerang secara cermat agar metode pengendalian yang diterapkan bisa efektif. Penggunaan pestisida alami seperti neem oil atau pestisida kimia dengan dosis yang dianjurkan dapat membantu mengendalikan populasi hama tersebut tanpa merusak tanaman. Selain itu, rotasi tanaman juga menjadi strategi penting untuk memutus siklus hidup hama yang mungkin berulang pada lahan yang sama. Kebersihan lahan harus dijaga dengan baik, termasuk membuang tanaman yang sudah terserang parah agar hama tidak menyebar ke tanaman lain. Dengan menerapkan langkah-langkah tersebut secara konsisten dan disiplin, petani dapat memastikan tanaman kentang tumbuh sehat dan panen yang diperoleh tetap optimal.</p>`,
    },
    {
      title: "Teknik Pemupukan yang Efektif untuk Tanaman Kentang",
      slug: "teknik-pemupukan-efektif-untuk-tanaman-kentang",
      bannerUrl: "/images/articleimage2.jpg",
      author: "Pak Tani",
      publishedAt: new Date("2025-08-11T09:30:00Z"),
      articleContent: `<p>Pemupukan merupakan aspek penting dalam budidaya kentang yang sangat menentukan keberhasilan hasil panen. Penggunaan pupuk yang tepat, baik jenis maupun dosisnya, akan membantu tanaman mendapatkan nutrisi yang dibutuhkan untuk tumbuh optimal. Pupuk kandang yang kaya akan bahan organik dapat meningkatkan kesuburan tanah, sementara pupuk kimia dapat melengkapi kebutuhan unsur hara spesifik seperti nitrogen, fosfor, dan kalium. Pemupukan dasar biasanya dilakukan pada saat persiapan lahan agar nutrisi tersedia sejak awal pertumbuhan. Selanjutnya, pemupukan susulan dilakukan saat tanaman mencapai umur sekitar 30 sampai 40 hari untuk memastikan kebutuhan nutrisi tetap terpenuhi selama fase pertumbuhan vegetatif dan pembentukan umbi. Penting bagi petani untuk tidak memberikan pupuk secara berlebihan karena dapat menyebabkan kerusakan tanaman dan pencemaran lingkungan. Dengan menerapkan teknik pemupukan yang tepat dan terukur, petani dapat meningkatkan produktivitas kentang dan menghasilkan produk berkualitas tinggi yang siap dipasarkan.</p>`,
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }

  console.log("Seed articles selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
