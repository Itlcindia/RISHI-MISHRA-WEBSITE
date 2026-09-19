import { PlaceHolderImages } from "@/lib/placeholder-images";

const newsImages = {
    news1: PlaceHolderImages.find(p => p.id === 'news-1'),
    news2: PlaceHolderImages.find(p => p.id === 'news-2'),
    news3: PlaceHolderImages.find(p => p.id === 'news-3'),
};

export const newsArticles = [
    {
        id: 1,
        title: { en: 'New Legal Aid Camp Announced for Sarojini Nagar', hi: 'सरोजिनी नगर के लिए नए कानूनी सहायता शिविर की घोषणा'},
        date: { en: 'October 26, 2023', hi: '२६ अक्टूबर, २०२३' },
        summary: { 
            en: 'To provide free legal advice to the residents, a new camp will be organized next month.', 
            hi: 'निवासियों को मुफ्त कानूनी सलाह प्रदान करने के लिए, अगले महीने एक नया शिविर आयोजित किया जाएगा।' 
        },
        image: newsImages.news1,
        imageHint: 'legal aid'
    },
    {
        id: 2,
        title: { en: 'Meeting with Farmers Union Discusses MSP Demands', hi: 'किसान संघ के साथ बैठक में एमएसपी मांगों पर चर्चा'},
        date: { en: 'October 22, 2023', hi: '२२ अक्टूबर, २०२३'},
        summary: { 
            en: 'Held a productive meeting with BKU leaders to strategize on the next steps for ensuring fair crop prices.',
            hi: 'फसलों की उचित कीमतें सुनिश्चित करने के लिए अगले कदमों पर रणनीति बनाने के लिए बीकेयू नेताओं के साथ एक उत्पादक बैठक की।'
        },
        image: newsImages.news2,
        imageHint: 'meeting farmers'
    },
    {
        id: 3,
        title: { en: 'Sonchiraiya NGO Launches "Back to School" Drive', hi: 'सोनचिरैया एनजीओ ने "बैक टू स्कूल" अभियान शुरू किया'},
        date: { en: 'October 18, 2023', hi: '१८ अक्टूबर, २०२३'},
        summary: { 
            en: 'A new initiative to enroll over 500 out-of-school children into local government schools has been launched.',
            hi: '500 से अधिक स्कूल से बाहर के बच्चों को स्थानीय सरकारी स्कूलों में नामांकित करने के लिए एक नई पहल शुरू की गई है।'
        },
        image: newsImages.news3,
        imageHint: 'children school'
    }
];
