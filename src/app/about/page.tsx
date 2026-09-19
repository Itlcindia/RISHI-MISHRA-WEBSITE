
'use client';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gavel, Leaf, Users, Award, Briefcase, Heart, BookOpen, MapPin, User, Calendar, GraduationCap, HeartHandshake, CheckCircle2, Circle, Trophy } from 'lucide-react';
import { StaggerWrap, StaggerItem } from '@/components/animations';
import AnimatedText from '@/components/animated-text';
import { Separator } from '@/components/ui/separator';

const aboutImage = PlaceHolderImages.find(p => p.id === 'about-page-main');
const bannerImage = PlaceHolderImages.find(p => p.id === 'gallery-1');
const aboutGalleryImages = [
    PlaceHolderImages.find(p => p.id === 'gallery-8'), // legal aid
    PlaceHolderImages.find(p => p.id === 'gallery-5'), // farmers
    PlaceHolderImages.find(p => p.id === 'gallery-3'), // ngo
    PlaceHolderImages.find(p => p.id === 'gallery-7'), // youth/community
].filter((p): p is ImagePlaceholder => !!p);

export default function AboutPage() {
  const { t, language } = useTranslation();

  const introData = [
    { label: { en: 'Name', hi: 'नाम' }, value: 'ऋषि मिश्रा', icon: <User className="h-4 w-4 text-accent" /> },
    { label: { en: "Father's Name", hi: 'पिता का नाम' }, value: 'श्री कृपा शंकर मिश्रा' },
    { label: { en: 'Religion & Caste', hi: 'धर्म एवं जाति' }, value: 'हिंदू (ब्राह्मण)' },
    { label: { en: 'Office Address', hi: 'कार्यालय पता' }, value: 'कल्ली पश्चिम, नियर किसान पथ, रायबरेली रोड, सरोजनी नगर, लखनऊ' },
    { label: { en: 'Nationality', hi: 'राष्ट्रीयता' }, value: 'भारतीय' },
    { label: { en: 'Education', hi: 'शिक्षा' }, value: 'बी.ए., एल.एल.बी.', icon: <GraduationCap className="h-4 w-4 text-accent" /> },
    { label: { en: 'Personality', hi: 'व्यक्तित्व' }, value: 'मृदुभाषी, मुखर वक्ता, सिद्धांतप्रिय एवं क्रांतिकारी व्यक्तित्व' },
    { label: { en: 'Occupation', hi: 'व्यवसाय' }, value: 'कृषि एवं व्यापार', icon: <Briefcase className="h-4 w-4 text-accent" /> },
    { label: { en: 'Current Positions', hi: 'वर्तमान पदभार' }, value: 'राष्ट्रीय अध्यक्ष / संस्थापक (भारतीय किसान क्रान्ति यूनियन) / (अधिवक्ता) | अध्यक्ष, सोन चिरैया संस्था' },
  ];

  const experienceData = [
    'दिनांक 24/03/2026 को भारतीय किसान क्रांति यूनियन का स्थापना दिवस एवं प्रेस वार्ता मोहनलालगंज स्थित घर की रसोई गेस्टहाउस में भव्य एवं ऐतिहासिक रूप से संपन्न हुआ, जिसमें प्रदेशभर से हजारों किसानों एवं पदाधिकारियों की सहभागिता रही।',
    'कार्यक्रम के दौरान संगठन विस्तार को मजबूती देते हुए 38 जिलाध्यक्षों का मनोनयन किया गया तथा विभिन्न जिला एवं प्रदेश स्तरीय पदाधिकारियों को मनोनयन पत्र प्रदान किए गए।',
    'राष्ट्रीय अध्यक्ष ऋषि मिश्रा ने किसानों के अधिकार, सम्मान एवं समस्याओं के समाधान के लिए संगठन को निरंतर संघर्षरत रहने का संकल्प दोहराया।',
    'प्रदेश अध्यक्ष बबलू यादव ने प्रदेशभर से आए किसान भाइयों का आभार व्यक्त करते हुए संगठन को मजबूत बनाने और किसान हितों के लिए एकजुट रहने का आह्वान किया।',
    'वर्ष 2007 से सोन चिरैया संस्था के माध्यम से समाज सेवा के कार्यों का प्रारम्भ।',
    'वर्ष 2010 में भारतीय किसान यूनियन (भानु) में ब्लॉक अध्यक्ष, सरोजनी नगर नियुक्त।',
    'वर्ष 2016 में भारतीय किसान यूनियन (भानु) के प्रदेश महासचिव बनाए गए।',
    'वर्ष 2022 में भारतीय किसान यूनियन (भानु) के प्रदेश प्रभारी नियुक्त।'
  ];

  const socialWorkData = [
    'गरीब कन्याओं के सामूहिक विवाह एवं विवाह समारोहों में सहयोग प्रदान करना।',
    'समय-समय पर संगठन के साथ रक्तदान कार्यक्रमों का आयोजन।',
    'आवारा पशुओं से किसानों को हो रही समस्याओं को लेकर आंदोलन कर किसानों को न्याय दिलाना।',
    'किसानों की भूमि हड़पने वाले भूमाफियाओं के विरुद्ध कार्रवाई हेतु सतत संघर्ष।',
    'कोरोना महामारी के दौरान गरीबों को भोजन, राशन, कपड़े, मास्क एवं सैनिटाइजर जैसी आवश्यक सहायता प्रदान करना।',
    'संगठन के सहयोग से समय-समय पर नगर एवं ग्रामीण क्षेत्रों में स्वच्छता अभियान।',
    'गर्भवती महिलाओं के टीकाकरण एवं बच्चों की शिक्षा हेतु जागरूकता अभियान।',
    'अधिग्रहित की गई किसान भूमि के उचित मुआवज़े हेतु किसान आंदोलन के माध्यम से अधिकार दिलाना।',
    'कोरोना काल में निजी विद्यालयों द्वारा फीस माफी एवं जरूरतमंद बच्चों को निःशुल्क शिक्षा दिलाने हेतु प्रयास।',
    'जनपद लखनऊ के सरोजनी नगर एवं मोहनलालगंज क्षेत्र में सड़कों की मरम्मत हेतु संबंधित विभागों को सक्रिय कराना।',
    'समय-समय पर स्वास्थ्य शिविर एवं निःशुल्क नेत्र चिकित्सा शिविरों का आयोजन, जिससे सैकड़ों लोगों को लाभ।',
    'किसान दुर्घटना बीमा योजना के अंतर्गत पीड़ित किसान परिवारों को बीमा लाभ दिलाना।',
    'आवारा पशुओं से फसलों की सुरक्षा हेतु गो-आश्रय स्थलों की मांग को लेकर आंदोलन।',
  ];

  const achievementData = [
    'गरीब, शोषित एवं वंचित वर्ग को सरकारी योजनाओं को जोड़कर लाभ दिलाना।',
    'प्रदेश के लगभग सभी जिलों में किसान एवं मजदूरों के अधिकारों के लिए धरना-प्रदर्शन, आमरण अनशन एवं जेल यात्रा।',
    '18 फरवरी 2023 को जनपद लखनऊ में किसान पदयात्रा, जिसके माध्यम से किसानों को भ्रष्टाचार के प्रति जागरूक किया एवं वरिष्ठ अधिकारियों से संवाद कर समाधान निकाला।',
  ];

  const footMarchGoals = [
    'सरकारी भूमि की लूट रोकना',
    'किसान आयोग का गठन',
    'किसानों के सम्मान की गारंटी',
    'प्रदेश में फैले भ्रष्टाचार का अंत'
  ];

  return (
    <div className="bg-background">
      {bannerImage ? (
        <section
          className="relative bg-cover bg-center bg-no-repeat py-24 md:py-48"
          style={{ backgroundImage: `url(${bannerImage.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
          <div className="relative container mx-auto px-4 md:px-6 text-center text-white">
            <StaggerWrap className="flex flex-col items-center">
              <StaggerItem>
                <div className="inline-block rounded-full bg-accent px-4 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
                  {t('about_section_title')}
                </div>
              </StaggerItem>
              <AnimatedText
                el="h1"
                text={t('hero_name')}
                className="font-headline text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl"
              />
              <AnimatedText
                el="p"
                text={t('hero_titles')}
                className="mx-auto mt-4 md:mt-6 max-w-3xl text-lg md:text-xl text-white/90 font-medium"
              />
            </StaggerWrap>
          </div>
        </section>
      ) : (
        <section className="bg-secondary py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 text-center">
             <StaggerWrap className="flex flex-col items-center">
              <StaggerItem>
                <div className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-accent mb-4 md:mb-6">
                  {t('about_section_title')}
                </div>
              </StaggerItem>
              <AnimatedText
                el="h1"
                text={t('hero_name')}
                className="font-headline text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-primary"
              />
              <AnimatedText
                el="p"
                text={t('hero_titles')}
                className="mx-auto mt-4 md:mt-6 max-w-3xl text-lg md:text-xl text-muted-foreground"
              />
            </StaggerWrap>
          </div>
        </section>
      )}

      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <StaggerWrap className="grid gap-12 lg:grid-cols-5 lg:gap-24">
            <div className="space-y-12 md:space-y-20 lg:col-span-3">
                {/* Intro Section */}
                <div className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                        </div>
                        <AnimatedText el="h2" text={t('About US')} className="font-headline text-3xl md:text-4xl font-extrabold text-primary" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-4 md:gap-y-6">
                        {introData.map((item, idx) => (
                            <div key={idx} className="flex flex-col space-y-1.5 border-b border-secondary pb-4 group hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-xl p-2">
                                <div className="flex items-center gap-2 text-muted-foreground text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                                    <span>{language === 'hi' ? item.label.hi : item.label.en}</span>
                                </div>
                                <div className="text-primary font-bold text-base md:text-lg leading-tight group-hover:text-accent transition-colors">
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Experience Section */}
                <div className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                            <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                        </div>
                        <AnimatedText el="h2" text={t('about Us')} className="font-headline text-3xl md:text-4xl font-extrabold text-primary" />
                    </div>
                    <div className="space-y-4 md:space-y-6">
                        {experienceData.map((item, idx) => (
                            <div key={idx} className="flex gap-4 md:gap-6 items-start group p-3 md:p-4 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="mt-1 flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-secondary text-primary transition-all group-hover:bg-accent group-hover:text-white group-hover:-rotate-12 group-hover:scale-110">
                                    <span className="font-bold text-xs md:text-sm">{idx + 1}</span>
                                </div>
                                <p className="text-base md:text-lg text-muted-foreground group-hover:text-primary transition-colors font-medium leading-relaxed">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social Work Section */}
                <div className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                            <HeartHandshake className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                        </div>
                        <AnimatedText el="h2" text={t('About Social Woorks')} className="font-headline text-3xl md:text-4xl font-extrabold text-primary" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {socialWorkData.map((item, idx) => (
                            <div key={idx} className="flex gap-3 md:gap-4 items-start p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl bg-secondary/30 border border-transparent hover:border-accent/30 hover:bg-white hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 group">
                                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 shrink-0 text-accent mt-0.5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                                <p className="text-xs md:text-sm text-primary font-medium leading-relaxed">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                            <Trophy className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                        </div>
                        <AnimatedText el="h2" text={t('Achievements')} className="font-headline text-3xl md:text-4xl font-extrabold text-primary" />
                    </div>
                    <div className="space-y-6 md:space-y-8">
                        {achievementData.map((item, idx) => (
                            <div key={idx} className="flex gap-4 md:gap-6 items-start group p-3 md:p-4 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="mt-1 flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-accent/5 text-accent group-hover:bg-accent group-hover:text-white group-hover:scale-110 transition-all">
                                    <Award className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <p className="text-lg md:text-xl text-primary font-bold leading-tight pt-2">{item}</p>
                            </div>
                        ))}
                        <div className="md:ml-16 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-accent/20 bg-accent/5 relative overflow-hidden shadow-premium hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Leaf className="h-16 w-16 md:h-24 md:w-24 text-accent rotate-12" />
                            </div>
                            <h4 className="font-black text-xl md:text-2xl text-accent mb-4 md:mb-6 uppercase tracking-tight">पदयात्रा का मुख्य उद्देश्य:</h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                {footMarchGoals.map((goal, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-base md:text-lg font-bold text-primary group">
                                        <div className="h-2 w-2 rounded-full bg-accent transition-all group-hover:scale-150" />
                                        <span>{goal}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <StaggerItem className="relative lg:col-span-2">
              <div className="lg:sticky lg:top-32 space-y-8 md:space-y-10">
                {aboutImage &&
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-premium transition-all duration-700 hover:shadow-2xl group">
                        <img
                            src={aboutImage.imageUrl}
                            alt={aboutImage.description}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            data-ai-hint={aboutImage.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10">
                            <p className="text-white font-headline text-2xl md:text-3xl font-black mb-2">{t('hero_name')}</p>
                            <div className="inline-block px-4 py-1.5 bg-accent text-white text-[10px] font-bold rounded-full uppercase tracking-widest font-hindi">
                                राष्ट्रीय अध्यक्ष / संस्थापक (भारतीय किसान क्रान्ति यूनियन) / (अधिवक्ता)
                            </div>
                        </div>
                    </div>
                }
                
                <Card className="bg-white border-secondary shadow-premium p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden transition-all duration-500 hover:shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-2 bg-accent" />
                    <CardHeader className="p-0 mb-6 md:mb-8">
                        <CardTitle className="text-xl md:text-2xl font-black text-primary">Quick Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4 md:space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white group-hover:scale-110 transition-all shrink-0">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-primary text-sm md:text-base">Lucknow, Uttar Pradesh</span>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white group-hover:scale-110 transition-all shrink-0">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-primary text-sm md:text-base">B.A., LL.B.</span>
                        </div>
                        <Separator className="bg-secondary" />
                        <p className="text-lg md:text-xl italic font-medium text-accent leading-relaxed">"न्याय और सेवा ही मेरा संकल्प है।"</p>
                        <Button className="w-full h-12 bg-primary text-white font-bold rounded-2xl hover:bg-accent transition-all shadow-premium" asChild>
                            <Link href="/contact">Get in Touch</Link>
                        </Button>
                    </CardContent>
                </Card>
              </div>
            </StaggerItem>
          </StaggerWrap>
        </div>
      </section>

       <section className="bg-white py-12 md:py-24">
        <div className="container mx-auto space-y-12 px-4 md:px-6 text-center">
           <div>
                <StaggerWrap className="grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-4">
                    {aboutGalleryImages.map((img) => (
                    <StaggerItem key={img.id}>
                        <Link href="/gallery" className="group relative block h-48 sm:h-64 md:h-72 w-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-premium transition-all duration-500 hover:shadow-2xl">
                        <img 
                            src={img.imageUrl} 
                            alt={img.description} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                            data-ai-hint={img.imageHint} 
                        />
                        <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors"></div>
                        </Link>
                    </StaggerItem>
                    ))}
                </StaggerWrap>
           </div>
        </div>
      </section>
    </div>
  );
}
