import React, { useState, useEffect, useRef } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import t from '../../locales/en.json';

import "./css/Form.css";

export default function Form({ isModal = false, t }) {
  const [step, setStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // URLSearchParams kullanarak query parametrelerini al
  const [searchParams, setSearchParams] = useState({});
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [language, setLanguage] = useState("English");
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const formRef = useRef(null);

  // SearchParams'ı useEffect ile ayarla
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};

    // 1. Path bilgisini al
    const path = window.location.pathname;  // örn. "/it" veya "/"

    // 2. İlk segment’i çıkar (başındaki "/" nedeniyle boş string olur)
    const segments = path.split('/').filter(Boolean);
    const slug = segments[0] || null;      // "it" veya null

    // 3. Slug’a göre dili belirle
    const language = slug === 'it'
      ? slug
      : 'English';
    
     
    // URL parametrelerini topla
    params.lang = language || "en";
    params.utm_source = urlParams.get("utm_source");
    params.utm_medium = urlParams.get("utm_medium");
    params.utm_campaign = urlParams.get("utm_campaign");
    params.utm_term = urlParams.get("utm_term");
    params.utm_ad = urlParams.get("utm_ad");
    params.promo = urlParams.get("promo");
    params.utm_content = urlParams.get("utm_content");
    params.utm_adgroup = urlParams.get("utm_adgroup");
    params.utm_device = urlParams.get("utm_device");
    params.utm_keyword = urlParams.get("utm_keyword");
    params.gclid = urlParams.get("gclid");
    
    setSearchParams(params);
  }, []);

  const showAlert = (type, message) => {
    setAlert({ show: false, type: "", message: "" });
    setAlert({ show: true, type, message });

    // 5 saniye sonra otomatik olarak mesajı gizle
    /* setTimeout(() => {
        setAlert({ show: false, type: "", message: "" });
      }, 5000);*/
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
    formType: isModal ? "Modal" : "Normal/Header",
    language: "en", // Bu değer useEffect'te güncellenecek
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmAd: "",
    utmPromo: "",
    utmContent: "",
    utmAdgroup: "",
    utmDevice: "",
    utmKeyword: "",
    gcLid: "",
    theme: typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") || "dark" : "dark",
    scrollDepth: "",
    durationTime: "",
  });

  // userInfo'yu searchParams ile güncelle
  useEffect(() => {
    if (Object.keys(searchParams).length > 0) {
      setUserInfo(prev => ({
        ...prev,
        language: searchParams.lang || prev.language,
        utmSource: searchParams.utm_source || prev.utmSource,
        utmMedium: searchParams.utm_medium || prev.utmMedium,
        utmCampaign: searchParams.utm_campaign || prev.utmCampaign,
        utmTerm: searchParams.utm_term || prev.utmTerm,
        utmAd: searchParams.utm_ad || prev.utmAd,
        utmPromo: searchParams.promo || prev.utmPromo,
        utmContent: searchParams.utm_content || prev.utmContent,
        utmAdgroup: searchParams.utm_adgroup || prev.utmAdgroup,
        utmDevice: searchParams.utm_device || prev.utmDevice,
        utmKeyword: searchParams.utm_keyword || prev.utmKeyword,
        gcLid: searchParams.gclid || prev.gcLid,
      }));
    }
  }, [searchParams]);

  const phoneInputRef = useRef(null);
  const intlTelInstanceRef = useRef(null);

  useEffect(() => {
    // Load intl-tel-input on component mount instead of waiting for focus
    async function loadIntlTelInput() {
      try {
        // CSS dosyasını dinamik olarak yükle
        await import("intl-tel-input/build/css/intlTelInput.css");

        // JS modülünü dinamik olarak yükle
        const intlTelInput = (await import("intl-tel-input")).default;

        function getDeviceType() {
          var userAgent = navigator.userAgent;
          let deviceType = "";
          if (/mobile/i.test(userAgent)) {
            deviceType = "Mobile";
          }
          if (/tablet/i.test(userAgent)) {
            deviceType = "Tablet";
          }
          if (/iPad|Android|Touch/.test(userAgent)) {
            deviceType = "Tablet";
          }
          setIsMobile(deviceType === "Mobile" || deviceType === "Tablet");
          return deviceType;
        }

        setUserInfo((prev) => ({ ...prev, device: getDeviceType() }));

        // Check if phoneInputRef is still valid
        if (!phoneInputRef.current) {
          console.warn("Phone input reference is no longer valid");
          return;
        }

        // Destroy existing instance if it exists
        if (intlTelInstanceRef.current) {
          try {
            intlTelInstanceRef.current.destroy();
          } catch (e) {
            console.warn("Error destroying previous instance:", e);
            // Clean up any lingering elements that might cause errors
            if (phoneInputRef.current && phoneInputRef.current.parentNode) {
              const parent = phoneInputRef.current.parentNode;
              // Remove all children except the input itself
              Array.from(parent.children).forEach(child => {
                if (child !== phoneInputRef.current) {
                  try {
                    parent.removeChild(child);
                  } catch (err) {
                    // Ignore removeChild errors
                  }
                }
              });
            }
          }
        }

        // Initialize intl-tel-input with error handling
        try {
          // First try to detect country
          console.log("Detecting country for Hero Form...");
          
          // Wrap the entire initialization in a try-catch to handle any errors
          try {
            // Fetch country data first, then initialize the input
            fetch("https://ipinfo.io/json?token=8ea20ca18bc48d")
              .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
              })
              .then((data) => {
                console.log("Country data received:", data);
                const country = data && data.country ? data.country.toLowerCase() : "tr";
                console.log("Detected country:", country);
                
                // Now initialize with the detected country
                try {
                  // Make sure the phoneInputRef is still valid
                  if (!phoneInputRef.current || !document.body.contains(phoneInputRef.current)) {
                    console.warn("Phone input reference is no longer in the DOM");
                    return;
                  }
                  
                  // Create a safe wrapper for the intlTelInput initialization
                  const safeInitialize = () => {
                    try {
                      intlTelInstanceRef.current = intlTelInput(phoneInputRef.current, {
                        initialCountry: country,
                        separateDialCode: true,
                        autoPlaceholder: "aggressive",
                        utilsScript:
                          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/25.2.1/build/js/utils.min.js",
                        preferredCountries: ["tr", "us", "gb", "it", "bg", "ru"],
                      });
                    } catch (err) {
                      console.error("Error in intlTelInput initialization:", err);
                    }
                  };
                  
                  // Use setTimeout to ensure DOM is ready
                  setTimeout(safeInitialize, 0);
                } catch (initError) {
                  console.error("Error initializing phone input:", initError);
                }
              })
              .catch((error) => {
                console.error("Error detecting country:", error);
                // Initialize with default country on error
                try {
                  // Make sure the phoneInputRef is still valid
                  if (!phoneInputRef.current || !document.body.contains(phoneInputRef.current)) {
                    console.warn("Phone input reference is no longer in the DOM");
                    return;
                  }
                  
                  // Create a safe wrapper for the intlTelInput initialization
                  const safeInitialize = () => {
                    try {
                      intlTelInstanceRef.current = intlTelInput(phoneInputRef.current, {
                        initialCountry: "tr",
                        separateDialCode: true,
                        autoPlaceholder: "aggressive",
                        utilsScript:
                          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/25.2.1/build/js/utils.min.js",
                        preferredCountries: ["tr", "us", "gb", "it", "bg", "ru"],
                      });
                    } catch (err) {
                      console.error("Error in intlTelInput initialization:", err);
                    }
                  };
                  
                  // Use setTimeout to ensure DOM is ready
                  setTimeout(safeInitialize, 0);
                } catch (initError) {
                  console.error("Error initializing phone input with default country:", initError);
                }
              });
          } catch (outerError) {
            console.error("Outer error in country detection:", outerError);
          }
        } catch (error) {
          console.error("Error initializing intl-tel-input:", error);
        }
      } catch (error) {
        console.error("Failed to load intl-tel-input:", error);
      }
    }

    loadIntlTelInput();
  }, []); // Remove isFocused dependency to ensure it loads on mount

  const getDisplayText = () => {
    if (selectedFiles.length === 0) {
      return t.selectFile;
    }
    if (selectedFiles.length === 1) {
      const name = selectedFiles[0].name;
      // If filename is too long, truncate it
      return name.length > 30 ? name.substring(0, 27) + "..." : name;
    }
    // For multiple files, show shorter first filename
    const firstName = selectedFiles[0].name;
    const truncatedName =
      firstName.length > 20 ? firstName.substring(0, 17) + "..." : firstName;
    return `${truncatedName} +${selectedFiles.length - 1} ${t.more}`;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);

    getDisplayText();
  };

  const nextStep = () => {
    if (step + 1 > 4) return;

    if (step === 1) {
      const name = document.getElementsByName("fullName")[0];

      if (name.value == "") {
        name.style.border = "1px solid red";
        return;
      }
    } else if (step === 2) {
      const email = document.getElementsByName("email")[0];
      const phone = phoneInputRef.current;
      const phoneDiv = document.getElementsByClassName("phone-input")[0];

      const phoneNumber = intlTelInstanceRef.current.telInput.value; // Get full number with country code
      const dialCode = intlTelInstanceRef.current.getSelectedCountryData().dialCode; // Get dial code

      const parsedNumber = parsePhoneNumberFromString("+" + dialCode + phoneNumber);

      if (email.value == "") {
        email.style.border = "1px solid red";
        return;
      }

      if (phone.value == "" || !parsedNumber.isValid()) {
        phoneDiv.style.border = "1px solid red";
        return;
      }
    }

    setStep(step + 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" && intlTelInstanceRef.current) {
      const phoneNumber = intlTelInstanceRef.current.telInput.value;
      const dialCode = intlTelInstanceRef.current.getSelectedCountryData().dialCode;
      setUserInfo((prev) => ({ ...prev, phone: "+" + dialCode + phoneNumber }));
    }

    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (typeof document !== "undefined") {
      const startTime = parseInt(document.body.getAttribute("data-starttime") || "0");
      const timeSpent = Date.now() - startTime;
      const secondsSpent = Math.floor(timeSpent / 1000);
      setUserInfo((prev) => ({ ...prev, durationTime: secondsSpent }));

      setUserInfo((prev) => ({
        ...prev,
        scrollDepth: document.body.getAttribute("data-scroll") || "",
      }));
    }
  };

  // Çeviri fonksiyonu - varsayılan olarak basit bir şekilde döndürüyor
  // Kendi çeviri sistemini burada uygulayabilirsin
  

  const validateForm = (parsedNumber) => {
    if (!userInfo.fullName.trim())
      return t.fullNameRequired;
    if (!userInfo.email.trim())
      return t.emailRequired;
    if (!userInfo.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return t.emailInvalid;
    if (!userInfo.phone.trim())
      return t.phoneRequired;
    if (!(parsedNumber && parsedNumber.isValid()))
      return t.phoneInvalid;

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (alert.show && alert.type === "processing") {
      return;
    }
    try {
      showAlert("processing", t.sendingMessage);
      
      if (intlTelInstanceRef.current) {
        const phoneNumber = intlTelInstanceRef.current.telInput.value;
        const dialCode = intlTelInstanceRef.current.getSelectedCountryData().dialCode;
        userInfo.phone = "+" + dialCode + phoneNumber;
      }
      
      const parsedNumber = parsePhoneNumberFromString(userInfo.phone);
      const validationError = validateForm(parsedNumber);
      if (validationError) {
        showAlert(
          "danger",
          t.sendMessageFormError + ". " + validationError
        );
        return;
      }

      try {
         // Convert files to base64
         const filesData = await Promise.all(
          selectedFiles.map(async (file) => {
            const base64Data = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => { 
                resolve(reader.result);
              };
              reader.onerror = (error) => reject(error);
            });

            return {
              fileName: file.name,
              base64Data,
              mimeType: file.type,
              size: file.size,
            };
          })
        );
        // API URL için import.meta.env kullanılıyor (Astro'da process.env yerine)
        const API_URL = "/api/sendMail";
        
        // Send to API
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            files: filesData,
            userInfo,
            
          }),
        });

        const data = await response.json();

        if (response.ok) {
          showAlert("success", t.sendSuccessfully);
          setUserInfo({
            fullName: "",
            email: "",
            phone: "",
            message: "",
          });
          e.target.reset();
        } else {
          throw new Error(data.message || "Upload failed");
        }
      } catch (error) {
        showAlert("danger", t.formError + " " + error.message);
      }
    } catch (error) {
      console.error("Error occured:", error);
    }
  };

  return (
    <>
    <div className="form-container">
      <div className="form-title">
        <span>{t.free}</span>
        <span>{t.consultation}</span>
        <span>{t.in}</span>
        <span>30</span>
        <span>{t.seconds}</span>
      </div>

      <form
        className="form"
        onSubmit={handleSubmit}
        onFocus={handleFocus}
        ref={formRef}
      >
        <div
          className="form-group"
          style={{ display: step == 1 ? "block" : "none" }}
        >
          <label className="form-label">{t.fullName}</label>
          <input
            type="text"
            className="form-input"
            placeholder={t.fullName}
            onChange={handleChange}
            name="fullName"
            required
          />
        </div>

        <div>
          <div
            className="form-group"
            style={{ display: step == 2 ? "block" : "none" }}
          >
            <label className="form-label">{t.email}</label>
            <input
              type="email"
              className="form-input"
              placeholder="example@mail.com"
              onChange={handleChange}
              name="email"
              onFocus={handleFocus}
              required
            />
          </div>
          <div
            className="form-group"
            style={{ display: step == 2 ? "block" : "none" }}
          >
            <label className="form-label">{t.phone}</label>
            <div className="phone-input">
              <input
                type="tel"
                id="phone"
                name="phone"
                className="phone-number"
                onChange={handleChange}
                ref={phoneInputRef}
                placeholder="xxx xxx xx xx"
                required
              />
            </div>
          </div>
        </div>

        <div
          className="form-group"
          style={{ display: step == 3 ? "block" : "none" }}
        >
          <label className="form-label show-mobile">{t.selectTreatment}</label>

          <div className="treatments">
            <ul className="step-radio-cont">
              <li className="step-radio">
                <label htmlFor="tratment_dhi">
                  <input
                    onChange={handleChange}
                    type="radio"
                    id="tratment_dhi"
                    value="DHI Hair Transplant"
                    name="message"
                  />
                  <p className="step-radio-text">{t.dhiHairTransplant}</p>
                </label>
              </li>
              <li className="step-radio">
                <label htmlFor="tratment_fue">
                  <input
                    onChange={handleChange}
                    type="radio"
                    id="tratment_fue"
                    value="FUE Hair Transplant"
                    name="message"
                  />
                  <p className="step-radio-text">{t.sapphireHairTransplant}</p>
                </label>
              </li>
              <li className="step-radio">
                <label htmlFor="tratment_sapphire">
                  <input
                    onChange={handleChange}
                    type="radio"
                    id="tratment_sapphire"
                    value="Sapphire Hair Transplant"
                    name="message"
                  />
                  <p className="step-radio-text">{t.fueHairTransplant}</p>
                </label>
              </li>
              <li className="step-radio">
                <label htmlFor="eyebrow_transplant">
                  <input
                    onChange={handleChange}
                    type="radio"
                    id="eyebrow_transplant"
                    value="Eyebrow Transplant"
                    name="message"
                  />
                  <p className="step-radio-text">{t.eyebrowTransplant}</p>
                </label>
              </li>
              <li className="step-radio">
                <label htmlFor="beard_transplant">
                  <input
                    onChange={handleChange}
                    type="radio"
                    id="beard_transplant"
                    value="Beard Transplant"
                    name="message"
                  />
                  <p className="step-radio-text">{t.beardTransplant}</p>
                </label>
              </li>
              <li className="step-radio">
                <label htmlFor="fut_hair_transplant">
                  <input
                    onChange={handleChange}
                    type="radio"
                    id="fut_hair_transplant"
                    value="FUT Hair Transplant"
                    name="message"
                  />
                  <p className="step-radio-text">{t.futHairTransplant}</p>
                </label>
              </li>
              <li className="step-radio ">
                <label htmlFor="robotic_hair_transplant">
                  <input
                    onChange={handleChange}
                    type="radio"
                    id="robotic_hair_transplant"
                    value="Robotic Hair Transplant"
                    name="message"
                  />
                  <p className="step-radio-text">{t.roboticHairTransplant}</p>
                </label>
              </li>
            </ul>
          </div>
        </div>

        <>
          <div
            className="form-group"
            style={{ display: step == 4 ? "block" : "none" }}
          >
            <div className="upload-container">
              <label className="upload-label">
                <div className="upload-button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="20"
                    height="20"
                    viewBox="0,0,256,256"
                  >
                    <g
                      fill="#0B2851"
                      fillRule="nonzero"
                      stroke="none"
                      strokeWidth="1"
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeMiterlimit="10"
                      strokeDasharray=""
                      strokeDashoffset="0"
                      fontFamily="none"
                      fontWeight="none"
                      fontSize="none"
                      textAnchor="none"
                      style={{ mixBlendMode: "normal" }}
                    >
                      <g transform="scale(2,2)">
                        <path d="M32,4c-7.2,0 -13,5.8 -13,13v52c0,1.7 1.3,3 3,3c1.7,0 3,-1.3 3,-3v-52c0,-3.9 3.1,-7 7,-7h51v7c0,7.2 5.8,13 13,13h10c1.7,0 3,-1.3 3,-3c0,-6.1 -2.39922,-11.90078 -6.69922,-16.30078c-4.4,-4.3 -10.20078,-6.69922 -16.30078,-6.69922zM89,10.30078c3.4,0.6 6.5,2.19922 9,4.69922c2.5,2.5 4.09922,5.6 4.69922,9h-6.69922c-3.9,0 -7,-3.1 -7,-7zM106,38c-1.7,0 -3,1.3 -3,3v66c0,3.9 -3.1,7 -7,7c-1.7,0 -3,1.3 -3,3c0,1.7 1.3,3 3,3c7.2,0 13,-5.8 13,-13v-66c0,-1.7 -1.3,-3 -3,-3zM80,41c-7.1797,0 -13,5.8203 -13,13c0,7.1797 5.8203,13 13,13c7.1797,0 13,-5.8203 13,-13c0,-7.1797 -5.8203,-13 -13,-13zM73.60938,79.57031c-0.56484,0.04805 -1.12188,0.25391 -1.60937,0.62891c-1.3,1.1 -1.40039,3.00078 -0.40039,4.30078l17.09961,20.5c0.6,0.7 1.40078,1 2.30078,1c0.7,0 1.4,-0.19922 2,-0.69922c1.3,-1.1 1.40078,-3.00117 0.30078,-4.20117l-17.10156,-20.5c-0.6875,-0.75 -1.64844,-1.10937 -2.58984,-1.0293zM52,81c-0.9,0 -1.70078,0.4 -2.30078,1l-30,35c-1.1,1.3 -0.89922,3.19922 0.30078,4.19922c0.6,0.5 1.39961,0.70117 2.09961,0.70117h59.90039c0.7,0 1.4,-0.20117 2,-0.70117c1.3,-1.1 1.40078,-2.99922 0.30078,-4.19922l-30,-35c-0.6,-0.6 -1.40078,-1 -2.30078,-1z"></path>
                      </g>
                    </g>
                  </svg>
                  <span className="button-text" id="buttonText">
                    {getDisplayText()}
                  </span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>
        </>

        <div className="form-group step-buttons" style={{ display: step == 4 ? "flex" : "none" }}>
          <button
            aria-label="Send!"
            type="submit"
            className="submit-btn"
          >
            {t.send}
          </button>
        </div>

        {step < 4 && (
          <div
            className="form-group step-buttons"
          >
            <button
              aria-label="Next"
              type="button"
              className="submit-btn next"
              onClick={nextStep}
            >
              {t.next}
            </button>
          </div>
        )}
      </form>

    

      <div id="progress-bar-container">
        <div id="progress-bar" style={{ width: `${(step / 4) * 100}%` }}></div>
      </div>

      <p className="privacy">{t.privacy}</p>
    </div>

{alert.show && (
  <div
    className={`alert ${alert.type}`}
    id={`message-alert-${alert.type}`}
  >
    {alert.message}
    {alert.type != "processing" && (
      <button
        className="close-button"
        onClick={() =>
          setAlert({ show: false, type: "", message: "" })
        }
      >
        ×
      </button>
    )}
  </div>
)}
</>
  );
}
