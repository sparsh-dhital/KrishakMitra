import re
import os

path = r"d:\sihh\demoooo\frontend\src\i18n.js"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

login_translations = """
const loginTranslations = {
  en: { backToHome: "Back to Home", accessDashboard: "Access your procurement dashboard", farmer: "Farmer", officerAdmin: "Officer (Admin)", buyerInstitution: "Buyer / Institution", fullName: "Full Name", enterName: "Enter your name", mobileNumber: "Mobile Number", enterMobile: "Enter 10-digit number", getOtp: "Get OTP", enterOtp: "Enter 6-digit OTP", sentTo: "Sent to +91", edit: "Edit", sendingOtp: "Sending OTP...", verifying: "Verifying...", verifyLogin: "Verify & Login", bypassDemo: "Bypass for Demo" },
  hi: { backToHome: "होम पर वापस जाएँ", accessDashboard: "अपने खरीद डैशबोर्ड तक पहुँचें", farmer: "किसान", officerAdmin: "अधिकारी (एडमिन)", buyerInstitution: "क्रेता / संस्थान", fullName: "पूरा नाम", enterName: "अपना नाम दर्ज करें", mobileNumber: "मोबाइल नंबर", enterMobile: "10-अंकों का नंबर दर्ज करें", getOtp: "OTP प्राप्त करें", enterOtp: "6-अंकों का OTP दर्ज करें", sentTo: "+91 पर भेजा गया", edit: "संपादित करें", sendingOtp: "OTP भेज रहे हैं...", verifying: "सत्यापन कर रहे हैं...", verifyLogin: "सत्यापित करें और लॉगिन करें", bypassDemo: "डेमो के लिए बायपास करें" },
  te: { backToHome: "హోమ్‌కి తిరిగి వెళ్లండి", accessDashboard: "మీ కొనుగోలు డాష్‌బోర్డ్‌ను యాక్సెస్ చేయండి", farmer: "రైతు", officerAdmin: "అధికారి (అడ్మిన్)", buyerInstitution: "కొనుగోలుదారు / సంస్థ", fullName: "పూర్తి పేరు", enterName: "మీ పేరు నమోదు చేయండి", mobileNumber: "మొబైల్ నంబర్", enterMobile: "10-అంకెల నంబర్‌ను నమోదు చేయండి", getOtp: "OTP పొందండి", enterOtp: "6-అంకెల OTP నమోదు చేయండి", sentTo: "+91 కు పంపబడింది", edit: "సవరించండి", sendingOtp: "OTP పంపుతోంది...", verifying: "ధృవీకరిస్తోంది...", verifyLogin: "ధృవీకరించండి మరియు లాగిన్ చేయండి", bypassDemo: "డెమో కోసం బైపాస్ చేయండి" },
  bn: { backToHome: "হোমে ফিরে যান", accessDashboard: "আপনার সংগ্রহ ড্যাশবোর্ড অ্যাক্সেস করুন", farmer: "কৃষক", officerAdmin: "কর্মকর্তা (অ্যাডমিন)", buyerInstitution: "ক্রেতা / প্রতিষ্ঠান", fullName: "পুরো নাম", enterName: "আপনার নাম লিখুন", mobileNumber: "মোবাইল নম্বর", enterMobile: "১০-সংখ্যার নম্বর লিখুন", getOtp: "OTP পান", enterOtp: "৬-সংখ্যার OTP লিখুন", sentTo: "+91 এ পাঠানো হয়েছে", edit: "সম্পাদনা করুন", sendingOtp: "OTP পাঠানো হচ্ছে...", verifying: "যাচাই করা হচ্ছে...", verifyLogin: "যাচাই করুন এবং লগইন করুন", bypassDemo: "ডেমোর জন্য বাইপাস করুন" },
  mr: { backToHome: "होमवर परत जा", accessDashboard: "तुमच्या खरेदी डॅशबोर्डवर प्रवेश करा", farmer: "शेतकरी", officerAdmin: "अधिकारी (प्रशासक)", buyerInstitution: "खरेदीदार / संस्था", fullName: "पूर्ण नाव", enterName: "तुमचे नाव प्रविष्ट करा", mobileNumber: "मोबाईल नंबर", enterMobile: "१०-अंकी क्रमांक प्रविष्ट करा", getOtp: "OTP मिळवा", enterOtp: "६-अंकी OTP प्रविष्ट करा", sentTo: "+91 वर पाठवले", edit: "संपादित करा", sendingOtp: "OTP पाठवत आहे...", verifying: "सत्यापित करत आहे...", verifyLogin: "सत्यापित करा आणि लॉगिन करा", bypassDemo: "डेमोसाठी बायपास करा" },
  ta: { backToHome: "முகப்பிற்குத் திரும்பு", accessDashboard: "உங்கள் கொள்முதல் டாஷ்போர்டை அணுகவும்", farmer: "விவசாயி", officerAdmin: "அதிகாரி (நிர்வாகி)", buyerInstitution: "வாங்குபவர் / நிறுவனம்", fullName: "முழு பெயர்", enterName: "உங்கள் பெயரை உள்ளிடவும்", mobileNumber: "மொபைல் எண்", enterMobile: "10 இலக்க எண்ணை உள்ளிடவும்", getOtp: "OTP பெறு", enterOtp: "6 இலக்க OTPஐ உள்ளிடவும்", sentTo: "+91 க்கு அனுப்பப்பட்டது", edit: "திருத்து", sendingOtp: "OTP அனுப்பப்படுகிறது...", verifying: "சரிபார்க்கிறது...", verifyLogin: "சரிபார்த்து உள்நுழையவும்", bypassDemo: "டெமோவிற்கு பைபாஸ்" },
  gu: { backToHome: "હોમ પર પાછા જાઓ", accessDashboard: "તમારા ખરીદ ડેશબોર્ડને ઍક્સેસ કરો", farmer: "ખેડૂત", officerAdmin: "અધિકારી (એડમિન)", buyerInstitution: "ખરીદનાર / સંસ્થા", fullName: "પૂરું નામ", enterName: "તમારું નામ દાખલ કરો", mobileNumber: "મોબાઇલ નંબર", enterMobile: "10-આંકડાનો નંબર દાખલ કરો", getOtp: "OTP મેળવો", enterOtp: "6-આંકડાનો OTP દાખલ કરો", sentTo: "+91 પર મોકલવામાં આવ્યું", edit: "ફેરફાર કરો", sendingOtp: "OTP મોકલી રહ્યા છીએ...", verifying: "ચકાસણી કરી રહ્યા છીએ...", verifyLogin: "ચકાસો અને લૉગિન કરો", bypassDemo: "ડેમો માટે બાયપાસ કરો" },
  kn: { backToHome: "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ", accessDashboard: "ನಿಮ್ಮ ಖರೀದಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸಿ", farmer: "ರೈತ", officerAdmin: "ಅಧಿಕಾರಿ (ಆಡಳಿತ)", buyerInstitution: "ಖರೀದಿದಾರ / ಸಂಸ್ಥೆ", fullName: "ಪೂರ್ಣ ಹೆಸರು", enterName: "ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ", mobileNumber: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", enterMobile: "10-ಅಂಕಿಯ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ", getOtp: "OTP ಪಡೆಯಿರಿ", enterOtp: "6-ಅಂಕಿಯ OTP ನಮೂದಿಸಿ", sentTo: "+91 ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ", edit: "ಸಂಪಾದಿಸಿ", sendingOtp: "OTP ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...", verifying: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...", verifyLogin: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಲಾಗಿನ್ ಮಾಡಿ", bypassDemo: "ಡೆಮೊಗಾಗಿ ಬೈಪಾಸ್ ಮಾಡಿ" },
  ml: { backToHome: "ഹോമിലേക്ക് മടങ്ങുക", accessDashboard: "നിങ്ങളുടെ സംഭരണ ഡാഷ്ബോർഡ് ആക്സസ് ചെയ്യുക", farmer: "കർഷകൻ", officerAdmin: "ഓഫീസർ (അഡ്മിൻ)", buyerInstitution: "വാങ്ങുന്നയാൾ / സ്ഥാപനം", fullName: "പൂർണ്ണമായ പേര്", enterName: "നിങ്ങളുടെ പേര് നൽകുക", mobileNumber: "മൊബൈൽ നമ്പർ", enterMobile: "10 അക്ക നമ്പർ നൽകുക", getOtp: "OTP നേടുക", enterOtp: "6 അക്ക OTP നൽകുക", sentTo: "+91 ലേക്ക് അയച്ചു", edit: "തിരുത്തുക", sendingOtp: "OTP അയയ്ക്കുന്നു...", verifying: "പരിശോധിക്കുന്നു...", verifyLogin: "പരിശോധിച്ച് ലോഗിൻ ചെയ്യുക", bypassDemo: "ഡെമോയ്ക്കായി ബൈപാസ് ചെയ്യുക" },
  pa: { backToHome: "ਹੋਮ 'ਤੇ ਵਾਪਸ ਜਾਓ", accessDashboard: "ਆਪਣੇ ਖਰੀਦ ਡੈਸ਼ਬੋਰਡ ਤੱਕ ਪਹੁੰਚ ਕਰੋ", farmer: "ਕਿਸਾਨ", officerAdmin: "ਅਧਿਕਾਰੀ (ਐਡਮਿਨ)", buyerInstitution: "ਖਰੀਦਦਾਰ / ਸੰਸਥਾ", fullName: "ਪੂਰਾ ਨਾਮ", enterName: "ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ", mobileNumber: "ਮੋਬਾਈਲ ਨੰਬਰ", enterMobile: "10-ਅੰਕਾਂ ਦਾ ਨੰਬਰ ਦਰਜ ਕਰੋ", getOtp: "OTP ਪ੍ਰਾਪਤ ਕਰੋ", enterOtp: "6-ਅੰਕਾਂ ਦਾ OTP ਦਰਜ ਕਰੋ", sentTo: "+91 'ਤੇ ਭੇਜਿਆ ਗਿਆ", edit: "ਸੋਧੋ", sendingOtp: "OTP ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...", verifying: "ਤਸਦੀਕ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...", verifyLogin: "ਤਸਦੀਕ ਕਰੋ ਅਤੇ ਲੌਗਇਨ ਕਰੋ", bypassDemo: "ਡੈਮੋ ਲਈ ਬਾਈਪਾਸ ਕਰੋ" },
  or: { backToHome: "ହୋମକୁ ଫେରନ୍ତୁ", accessDashboard: "ଆପଣଙ୍କ କ୍ରୟ ଡ୍ୟାସବୋର୍ଡକୁ ଆକ୍ସେସ କରନ୍ତୁ", farmer: "କୃଷକ", officerAdmin: "ଅଧିକାରୀ (ଆଡମିନ)", buyerInstitution: "କ୍ରେତା / ଅନୁଷ୍ଠାନ", fullName: "ପୂରା ନାମ", enterName: "ଆପଣଙ୍କ ନାମ ପ୍ରବେଶ କରନ୍ତୁ", mobileNumber: "ମୋବାଇଲ ନମ୍ବର", enterMobile: "10-ଅଙ୍କ ବିଶିଷ୍ଟ ନମ୍ବର ପ୍ରବେଶ କରନ୍ତୁ", getOtp: "OTP ପ୍ରାପ୍ତ କରନ୍ତୁ", enterOtp: "6-ଅଙ୍କ ବିଶିଷ୍ଟ OTP ପ୍ରବେଶ କରନ୍ତୁ", sentTo: "+91 କୁ ପଠାଯାଇଛି", edit: "ସମ୍ପାଦନ କରନ୍ତୁ", sendingOtp: "OTP ପଠାଯାଉଛି...", verifying: "ଯାଞ୍ଚ କରାଯାଉଛି...", verifyLogin: "ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ ଲଗଇନ୍ କରନ୍ତୁ", bypassDemo: "ଡେମୋ ପାଇଁ ବାଇପାସ୍ କରନ୍ତୁ" },
  ur: { backToHome: "ہوم پر واپس جائیں", accessDashboard: "اپنے خریداری ڈیش بورڈ تک رسائی حاصل کریں", farmer: "کسان", officerAdmin: "افسر (ایڈمن)", buyerInstitution: "خریدار / ادارہ", fullName: "پورا نام", enterName: "اپنا نام درج کریں", mobileNumber: "موبائل نمبر", enterMobile: "10 ہندسوں کا نمبر درج کریں", getOtp: "OTP حاصل کریں", enterOtp: "6 ہندسوں کا OTP درج کریں", sentTo: "+91 پر بھیجا گیا", edit: "ترمیم کریں", sendingOtp: "OTP بھیجا جا رہا ہے...", verifying: "تصدیق کی جا رہی ہے...", verifyLogin: "تصدیق کریں اور لاگ ان کریں", bypassDemo: "ڈیمو کے لیے بائی پاس کریں" },
};
"""

target = """Object.keys(resources).forEach((code) => {
  resources[code].translation = {
    ...base,
    ...resources[code].translation,
    ...adminTranslations[code],
  };
});"""

replacement = """Object.keys(resources).forEach((code) => {
  resources[code].translation = {
    ...base,
    ...resources[code].translation,
    ...adminTranslations[code],
    login: loginTranslations[code] || loginTranslations.en,
  };
});"""

if target in content:
    content = content.replace(target, login_translations + "\n" + replacement)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Target block not found.")
