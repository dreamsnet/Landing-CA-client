// AnalyticsCollector.js
'use client';
import React, { useEffect, useRef } from 'react';
import {UAParser} from 'ua-parser-js';

//console.log('AnalyticsCollector module loaded');

const ANALYTICS_ENDPOINT = 'https://okaj5g6hpoesma3nnztpz3x74m0sflcz.lambda-url.us-east-2.on.aws/'; // bir tane lazım //tabi efendim

const AnalyticsCollector = () => {
  //console.log('AnalyticsCollector component rendered');
  const dataRef = useRef({});
  const startTimeRef = useRef(Date.now());
  const sessionIdRef = useRef(null);
  const lastSentTimeRef = useRef(Date.now());
  const isInitialSendRef = useRef(true);
  const isMobileRef = useRef(false);
  const maxScrollDepthRef = useRef(0);

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const getDetailedDeviceInfo = () => {
    const parser = new UAParser();
    const result = parser.getResult();
    let detailedModel = 'Unknown Model';
    const vendor = result.device.vendor || 'Unknown Vendor';

    const getIOSVersion = () => {
      const match = result.ua.match(/OS (\d+_\d+)/);
      return match ? match[1].replace('_', '.') : '';
    };

    const getAndroidVersion = () => {
      const match = result.ua.match(/Android (\d+(\.\d+)?)/);
      return match ? match[1] : '';
    };

    if (result.os.name === 'iOS') {
      const iosVersion = getIOSVersion();
      if (result.device.model === 'iPhone') {
        // Attempt to determine iPhone model based on screen size and iOS version
        const { width, height } = window.screen;
        const screenSize = Math.max(width, height);
        if (screenSize === 812 || screenSize === 844) detailedModel = 'iPhone X/XS/11 Pro/12 Mini/13 Mini';
        else if (screenSize === 896 || screenSize === 926) detailedModel = 'iPhone XS Max/XR/11/11 Pro Max/12 Pro Max/13 Pro Max';
        else if (screenSize === 667) detailedModel = 'iPhone 6/6S/7/8';
        else if (screenSize === 736) detailedModel = 'iPhone 6+/6S+/7+/8+';
        else detailedModel = `iPhone (iOS ${iosVersion})`;
      } else if (result.device.model === 'iPad') {
        detailedModel = `iPad (iOS ${iosVersion})`;
      }
    } else if (result.os.name === 'Android') {
      const androidVersion = getAndroidVersion();
      if (vendor !== 'Unknown Vendor') {
        detailedModel = `${vendor} Android Device (Android ${androidVersion})`;
      } else {
        detailedModel = `Android Device (Android ${androidVersion})`;
      }
    } else {
      detailedModel = `${vendor} ${result.device.model || 'Unknown Model'}`;
    }

    return {
      deviceModel: detailedModel,
      deviceVendor: vendor,
      osName: result.os.name,
      osVersion: result.os.version,
      browserName: result.browser.name,
      browserVersion: result.browser.version
    };
  };

  const getUTMParameters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_adgroup: urlParams.get('utm_adgroup') || '',
      utm_term: urlParams.get('utm_term') || '',
      utm_device: urlParams.get('utm_device') || '',
      gad_source: urlParams.get('gad_source') || '',
      gclid: urlParams.get('gclid') || ''
    };
  };

  const updateData = () => {
    const deviceInfo = getDetailedDeviceInfo();
    const utmParams = getUTMParameters();
    const currentTime = Date.now();

    dataRef.current = {
      ...dataRef.current,
      timestamp: new Date().toISOString(),
      sessionId: sessionIdRef.current,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer,
      deviceType: isMobileRef.current ? 'mobile' : 'desktop',
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
      ...deviceInfo,
      ...utmParams,
      timeOnSite: Math.round((currentTime - startTimeRef.current) / 1000),
      pageUrl: window.location.href,
      whatsappClicks: dataRef.current.whatsappClicks || 0,
      formSubmissions: dataRef.current.formSubmissions || 0,
      scrollDepth: maxScrollDepthRef.current, // Keep the field name as 'scrollDepth' for DB compatibility
      mouseMovements: dataRef.current.mouseMovements || 0,
      keyboardEvents: dataRef.current.keyboardEvents || 0,
      clickEvents: dataRef.current.clickEvents || 0,
      formInteractions: dataRef.current.formInteractions || 0
    };
  };

  const sendData = (isFinalSend = false) => {
    updateData();
    const currentTime = Date.now();
    
    if (isFinalSend || isInitialSendRef.current || currentTime - lastSentTimeRef.current >= 5000) {
      //console.log(dataRef.current);
      fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataRef.current),
        keepalive: isFinalSend
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        //console.log('Analytics data sent successfully');
        lastSentTimeRef.current = currentTime;
        isInitialSendRef.current = false;
      })
      .catch(error => {
        console.error('Error sending analytics data:', error);
      });
    }
  };

  const updateScrollDepth = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const newScrollDepth = Math.round(scrollTop);
    maxScrollDepthRef.current = Math.max(maxScrollDepthRef.current, newScrollDepth);
    //console.log('Current scroll depth:', maxScrollDepthRef.current);
  };

  const trackMouseMovements = () => {
    dataRef.current.mouseMovements = (dataRef.current.mouseMovements || 0) + 1;
  };

  const trackKeyboardEvents = () => {
    dataRef.current.keyboardEvents = (dataRef.current.keyboardEvents || 0) + 1;
  };

  const trackClicks = (e) => {
    dataRef.current.clickEvents = (dataRef.current.clickEvents || 0) + 1;
    
    // Check if the clicked element is a WhatsApp button
    if (e.target && typeof e.target.closest === 'function' && e.target.closest('a[href*="api.whatsapp.com"]')) {
      dataRef.current.whatsappClicks = (dataRef.current.whatsappClicks || 0) + 1;
      sendData(); // Send data immediately on WhatsApp click
    }
  };

  const trackFormInteractions = (e) => {
    if (e.target && e.target.tagName && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON')) {
      dataRef.current.formInteractions = (dataRef.current.formInteractions || 0) + 1;
    }
  };

  const trackFormSubmission = (e) => {
    if (e.target && e.target.tagName === 'FORM') {
      dataRef.current.formSubmissions = (dataRef.current.formSubmissions || 0) + 1;
      sendData(true); // Send data immediately on form submission
    }
  };

  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  useEffect(() => {
    //console.log('AnalyticsCollector initialized');

    // Check if we're on the thank you page
    if (window.location.href.includes('/thank-you/')) {
      return; // Don't collect analytics on the thank you page
    }

    // Retrieve or generate session ID
    const storedSessionId = sessionStorage.getItem('analyticsSessionId');
    if (storedSessionId) {
      sessionIdRef.current = storedSessionId;
    } else {
      sessionIdRef.current = generateSessionId();
      sessionStorage.setItem('analyticsSessionId', sessionIdRef.current);
    }

    // Determine if the device is mobile
    isMobileRef.current = /Mobi|Android/i.test(navigator.userAgent);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        sendData();
      }
    };

    const throttledUpdateScrollDepth = throttle(updateScrollDepth, 100);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('scroll', throttledUpdateScrollDepth);
    window.addEventListener('resize', throttledUpdateScrollDepth);
    window.addEventListener('mousemove', throttle(trackMouseMovements, 100));
    window.addEventListener('keydown', trackKeyboardEvents);
    window.addEventListener('click', trackClicks);
    document.addEventListener('input', trackFormInteractions);
    document.addEventListener('submit', trackFormSubmission, true);
    window.addEventListener('beforeunload', () => sendData(true));

    if (isMobileRef.current) {
      window.addEventListener('touchmove', throttledUpdateScrollDepth);
      window.addEventListener('touchend', throttledUpdateScrollDepth);
    }

    const dataInterval = setInterval(() => sendData(), 5000); // Send data every 5 seconds

    updateScrollDepth(); // Initial scroll depth calculation
    sendData(); // Initial send

    return () => {
      clearInterval(dataInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', throttledUpdateScrollDepth);
      window.removeEventListener('resize', throttledUpdateScrollDepth);
      window.removeEventListener('mousemove', trackMouseMovements);
      window.removeEventListener('keydown', trackKeyboardEvents);
      window.removeEventListener('click', trackClicks);
      document.removeEventListener('input', trackFormInteractions);
      document.removeEventListener('submit', trackFormSubmission, true);
      window.removeEventListener('beforeunload', () => sendData(true));
      if (isMobileRef.current) {
        window.removeEventListener('touchmove', throttledUpdateScrollDepth);
        window.removeEventListener('touchend', throttledUpdateScrollDepth);
      }
      sendData(true);
      //console.log('AnalyticsCollector cleanup');
    };
  }, []);

  return null;
};

export default AnalyticsCollector;
