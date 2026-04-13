import photo1 from "@/assets/photo-slider-1.jpg";
import photo2 from "@/assets/photo-slider-2.jpg";
import photo3 from "@/assets/photo-slider-3.jpg";
import photo4 from "@/assets/photo-slider-4.jpg";
import photo5 from "@/assets/photo-slider-5.jpg";
import photo6 from "@/assets/photo-slider-6.jpg";

const photos = [
  { src: photo1, alt: "Deelnemers in gesprek aan de ronde tafel" },
  { src: photo2, alt: "Bedrijfsleiders luisteren aandachtig" },
  { src: photo3, alt: "Deelnemer deelt inzichten met de groep" },
  { src: photo4, alt: "HR-verantwoordelijke in gesprek" },
  { src: photo5, alt: "Groepsgesprek rond de tafel" },
  { src: photo6, alt: "Deelneemster vertelt haar verhaal" },
];

// Duplicate for seamless loop
const allPhotos = [...photos, ...photos];

const PhotoSlider = () => (
  <section className="py-12 bg-background overflow-hidden">
    <div className="container max-w-5xl mx-auto px-6 mb-6">
      <p className="text-[#315eff] font-heading text-xs font-semibold uppercase tracking-[0.2em]">
        Sfeerbeelden uit eerdere edities
      </p>
      <p className="text-muted-foreground font-body text-sm mt-2">
        Vanaf editie 2 kiezen we bewust voor kleinere tafels. Intiemer, scherper, persoonlijker.
      </p>
    </div>
    <div className="relative">
      <div className="flex gap-4 animate-marquee">
        {allPhotos.map((photo, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[320px] md:w-[420px] h-[220px] md:h-[280px] rounded-xl overflow-hidden"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PhotoSlider;
