/* A polyfill for browsers that don't support ligatures. */
/* The script tag referring to this file must be placed before the ending body tag. */

/* To provide support for elements dynamically added, this script adds
   method 'icomoonLiga' to the window object. You can pass element references to this method.
*/
(function () {
    'use strict';
    function supportsProperty(p) {
        var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
            i,
            div = document.createElement('div'),
            ret = p in div.style;
        if (!ret) {
            p = p.charAt(0).toUpperCase() + p.substr(1);
            for (i = 0; i < prefixes.length; i += 1) {
                ret = prefixes[i] + p in div.style;
                if (ret) {
                    break;
                }
            }
        }
        return ret;
    }
    var icons;
    if (!supportsProperty('fontFeatureSettings')) {
        icons = {
            'd_rotation': '&#xe900;',
            '4k': '&#xe901;',
            '360': '&#xe902;',
            'ac_unit': '&#xe903;',
            'access_alarm': '&#xe904;',
            'access_alarms': '&#xe905;',
            'access_time': '&#xe906;',
            'accessibility_new': '&#xe907;',
            'accessibility': '&#xe908;',
            'accessible_forward': '&#xe909;',
            'accessible': '&#xe90a;',
            'account_balance_wallet': '&#xe90b;',
            'account_balance': '&#xe90c;',
            'account_box': '&#xe90d;',
            'account_circle': '&#xe90e;',
            'adb': '&#xe90f;',
            'add_a_photo': '&#xe910;',
            'add_alarm': '&#xe911;',
            'add_box': '&#xe912;',
            'add_circle_24px': '&#xe913;',
            'add_circle': '&#xe914;',
            'add_comment': '&#xe915;',
            'add_location': '&#xe916;',
            'add_photo_alternate': '&#xe917;',
            'add_shopping_cart': '&#xe918;',
            'add_to_home_screen': '&#xe919;',
            'add_to_photos': '&#xe91a;',
            'add_to_queue': '&#xe91b;',
            'add': '&#xe91c;',
            'adjust': '&#xe91d;',
            'airline_seat_flat_angled': '&#xe91e;',
            'airline_seat_flat': '&#xe91f;',
            'airline_seat_individual_suite': '&#xe920;',
            'airplanemode_active': '&#xe926;',
            'airplay': '&#xe928;',
            'airport_shuttle': '&#xe929;',
            'alarm_add': '&#xe92a;',
            'alarm_off': '&#xe92b;',
            'alarm_on': '&#xe92c;',
            'alarm': '&#xe92d;',
            'album': '&#xe92e;',
            'all_inbox': '&#xe92f;',
            'all_inclusive': '&#xe930;',
            'all_out': '&#xe931;',
            'alternate_email': '&#xe932;',
            'android': '&#xe933;',
            'announcement': '&#xe934;',
            'apps': '&#xe935;',
            'archive': '&#xe936;',
            'arrow_back_ios': '&#xe937;',
            'arrow_back': '&#xe938;',
            'arrow_downward': '&#xe939;',
            'arrow_drop_down_circle': '&#xe93a;',
            'arrow_drop_up': '&#xe93b;',
            'arrow_forward_ios': '&#xe93c;',
            'arrow_forward': '&#xe93d;',
            'arrow_left': '&#xe93e;',
            'arrow_right_alt': '&#xe93f;',
            'arrow_right': '&#xe940;',
            'arrow_upward': '&#xe941;',
            'art_track': '&#xe942;',
            'aspect_ratio': '&#xe943;',
            'assessment': '&#xe944;',
            'assignment_ind': '&#xe945;',
            'assignment_late': '&#xe946;',
            'assignment_return': '&#xe947;',
            'assignment_returned': '&#xe948;',
            'assignment_turned_in': '&#xe949;',
            'assignment': '&#xe94a;',
            'assistant_photo': '&#xe94b;',
            'assistant': '&#xe94c;',
            'atm': '&#xe94d;',
            'attach_file': '&#xe94e;',
            'attach_money': '&#xe94f;',
            'attachment': '&#xe950;',
            'audiotrack': '&#xe951;',
            'autorenew': '&#xe952;',
            'av_timer': '&#xe953;',
            'backspace': '&#xe954;',
            'backup': '&#xe955;',
            'ballot': '&#xe956;',
            'bar_chart': '&#xe957;',
            'beach_access': '&#xe975;',
            'beenhere': '&#xe976;',
            'block': '&#xe977;',
            'bluetooth_audio': '&#xe978;',
            'bluetooth_connected': '&#xe979;',
            'bluetooth_disabled': '&#xe97a;',
            'bluetooth_searching': '&#xe97b;',
            'bluetooth': '&#xe97c;',
            'blur_circular': '&#xe97d;',
            'blur_linear': '&#xe97e;',
            'blur_off': '&#xe97f;',
            'blur_on': '&#xe980;',
            'book': '&#xe981;',
            'bookmark_border': '&#xe982;',
            'bookmark': '&#xe983;',
            'bookmarks': '&#xe984;',
            'border_all': '&#xe985;',
            'border_bottom': '&#xe986;',
            'border_clear': '&#xe987;',
            'border_horizontal': '&#xe98b;',
            'border_inner': '&#xe98c;',
            'border_left': '&#xe98d;',
            'border_outer': '&#xe98e;',
            'border_right': '&#xe98f;',
            'border_style': '&#xe990;',
            'border_top': '&#xe991;',
            'border_vertical': '&#xe992;',
            'branding_watermark': '&#xe993;',
            'brightness_1': '&#xe994;',
            'brightness_2': '&#xe995;',
            'brightness_3': '&#xe996;',
            'brightness_4': '&#xe997;',
            'brightness_5': '&#xe998;',
            'brightness_6': '&#xe999;',
            'brightness_7': '&#xe99a;',
            'brightness_auto': '&#xe99b;',
            'brightness_high': '&#xe99c;',
            'brightness_low': '&#xe99d;',
            'brightness_medium': '&#xe99e;',
            'broken_image': '&#xe99f;',
            'brush': '&#xe9a0;',
            'bubble_chart': '&#xe9a1;',
            'bug_report': '&#xe9a2;',
            'build': '&#xe9a3;',
            'burst_mode': '&#xe9a4;',
            'business_center': '&#xe9a5;',
            'business': '&#xe9a6;',
            'cached': '&#xe9a7;',
            'cake': '&#xe9a8;',
            'calendar_today': '&#xe9a9;',
            'calendar_view_day': '&#xe9aa;',
            'call_end': '&#xe9ab;',
            'call_made': '&#xe9ac;',
            'call_merge': '&#xe9ad;',
            'call_missed_outgoing': '&#xe9ae;',
            'call_missed': '&#xe9af;',
            'call_received': '&#xe9b0;',
            'call_split': '&#xe9b1;',
            'call_to_action': '&#xe9b2;',
            'call': '&#xe9b3;',
            'camera_alt': '&#xe9b4;',
            'camera_enhance': '&#xe9b5;',
            'camera_front': '&#xe9b6;',
            'camera_rear': '&#xe9b7;',
            'camera_roll': '&#xe9b8;',
            'camera': '&#xe9b9;',
            'cancel_presentation': '&#xe9ba;',
            'cancel': '&#xe9bb;',
            'card_giftcard': '&#xe9bc;',
            'card_membership': '&#xe9bd;',
            'card_travel': '&#xe9be;',
            'casino': '&#xe9bf;',
            'cast_connected': '&#xe9c0;',
            'cast_for_education': '&#xe9c1;',
            'cast': '&#xe9c2;',
            'category': '&#xe9c3;',
            'center_focus_strong': '&#xe9c6;',
            'center_focus_weak': '&#xe9c7;',
            'change_history': '&#xe9c8;',
            'chat_bubble_24px': '&#xe9c9;',
            'chat_bubble': '&#xe9ca;',
            'chat': '&#xe9cb;',
            'check_box_outline_blank': '&#xe9cc;',
            'check_box': '&#xe9cd;',
            'check_circle_24px': '&#xe9ce;',
            'check_circle': '&#xe9cf;',
            'chevron_left': '&#xe9d0;',
            'chevron_right': '&#xe9d1;',
            'child_care': '&#xe9d2;',
            'child_friendly': '&#xe9d3;',
            'chrome_reader_mode': '&#xe9d4;',
            'class': '&#xe9d5;',
            'clear_all': '&#xe9d6;',
            'clear': '&#xe9d7;',
            'close-1': '&#xe9d8;',
            'close': '&#xe9d9;',
            'closed_caption': '&#xe9da;',
            'cloud_circle': '&#xe9db;',
            'cloud_done': '&#xe9dc;',
            'cloud_download': '&#xe9dd;',
            'cloud_off': '&#xe9de;',
            'cloud_queue': '&#xe9df;',
            'cloud_upload': '&#xe9e0;',
            'cloud': '&#xe9e1;',
            'code': '&#xe9e2;',
            'collections_bookmark': '&#xe9e3;',
            'collections': '&#xe9e4;',
            'color_lens': '&#xe9e5;',
            'colorize': '&#xe9e6;',
            'comment': '&#xe9e7;',
            'commute': '&#xe9e8;',
            'compare_arrows': '&#xe9e9;',
            'compare': '&#xe9ea;',
            'compass_calibration': '&#xe9eb;',
            'computer': '&#xe9ec;',
            'confirmation_number': '&#xe9ed;',
            'contact_mail': '&#xe9ee;',
            'contact_phone': '&#xe9ef;',
            'contact_support': '&#xe9f0;',
            'contacts': '&#xe9f1;',
            'control_camera': '&#xe9f2;',
            'control_point_duplicate': '&#xe9f3;',
            'control_point': '&#xe9f4;',
            'copyright': '&#xe9f5;',
            'create_new_folder': '&#xe9f6;',
            'create': '&#xe9f7;',
            'credit_card': '&#xe9f8;',
            'crop_3_2': '&#xe9f9;',
            'crop_5_4': '&#xe9fa;',
            'crop_7_5': '&#xe9fb;',
            'crop_16_9': '&#xe9fc;',
            'crop_din': '&#xe9fd;',
            'crop_free': '&#xe9fe;',
            'crop_landscape': '&#xe9ff;',
            'crop_original': '&#xea00;',
            'crop_portrait': '&#xea01;',
            'crop_rotate': '&#xea02;',
            'crop_square': '&#xea03;',
            'crop': '&#xea04;',
            'dashboard': '&#xea05;',
            'data_usage': '&#xea06;',
            'date_range': '&#xea07;',
            'dehaze': '&#xea08;',
            'delete_24px': '&#xea09;',
            'delete_forever': '&#xea0a;',
            'delete_sweep': '&#xea0b;',
            'delete': '&#xea0c;',
            'departure_board': '&#xea0d;',
            'description': '&#xea0e;',
            'desktop_access_disabled': '&#xea0f;',
            'desktop_mac': '&#xea10;',
            'desktop_windows': '&#xea11;',
            'details': '&#xea12;',
            'developer_board': '&#xea13;',
            'developer_mode': '&#xea14;',
            'device_hub': '&#xea15;',
            'device_unknown': '&#xea16;',
            'devices_other': '&#xea17;',
            'devices': '&#xea18;',
            'dialer_sip': '&#xea19;',
            'dialpad': '&#xea1a;',
            'directions_bike': '&#xea1b;',
            'directions_boat': '&#xea1c;',
            'directions_bus': '&#xea1d;',
            'directions_car': '&#xea1e;',
            'directions_railway': '&#xea1f;',
            'directions_run': '&#xea20;',
            'directions_subway': '&#xea21;',
            'directions_transit': '&#xea22;',
            'directions_walk': '&#xea23;',
            'directions': '&#xea24;',
            'disc_full': '&#xea25;',
            'dns': '&#xea26;',
            'dock': '&#xea27;',
            'domain_disabled': '&#xea28;',
            'domain': '&#xea29;',
            'done_24px': '&#xea2a;',
            'done_all': '&#xea2b;',
            'done': '&#xea2c;',
            'drafts': '&#xea2f;',
            'drag_handle': '&#xea30;',
            'drag_indicator': '&#xea31;',
            'drive_eta': '&#xea32;',
            'duo': '&#xea33;',
            'dvr': '&#xea34;',
            'edit_attributes': '&#xea35;',
            'edit_location': '&#xea36;',
            'edit': '&#xea37;',
            'eject': '&#xea38;',
            'email': '&#xea39;',
            'enhanced_encryption': '&#xea3a;',
            'equalizer': '&#xea3b;',
            'euro_symbol': '&#xea3c;',
            'ev_station': '&#xea3d;',
            'event_busy': '&#xea3e;',
            'event_note': '&#xea3f;',
            'event_seat': '&#xea40;',
            'event': '&#xea41;',
            'exit_to_app': '&#xea42;',
            'expand_less': '&#xea43;',
            'explicit': '&#xea44;',
            'explore_off': '&#xea45;',
            'explore': '&#xea46;',
            'exposure_neg_1': '&#xea47;',
            'exposure_neg_2': '&#xea48;',
            'exposure_plus_1': '&#xea49;',
            'exposure_plus_2': '&#xea4a;',
            'exposure_zero': '&#xea4b;',
            'exposure': '&#xea4c;',
            'extension': '&#xea4d;',
            'face': '&#xea4e;',
            'fast_forward': '&#xea4f;',
            'fast_rewind': '&#xea50;',
            'favorite_border': '&#xea52;',
            'favorite': '&#xea53;',
            'featured_play_list': '&#xea54;',
            'featured_video': '&#xea55;',
            'feedback': '&#xea56;',
            'fiber_manual_record': '&#xea57;',
            'fiber_new': '&#xea58;',
            'fiber_pin': '&#xea59;',
            'fiber_smart_record': '&#xea5a;',
            'file_copy': '&#xea5b;',
            'filter_1': '&#xea5c;',
            'filter_2': '&#xea5d;',
            'filter_3': '&#xea5e;',
            'filter_4': '&#xea5f;',
            'filter_5': '&#xea60;',
            'filter_6': '&#xea61;',
            'filter_7': '&#xea62;',
            'filter_8': '&#xea63;',
            'filter_9_plus': '&#xea64;',
            'filter_9': '&#xea65;',
            'filter_b_and_w': '&#xea66;',
            'filter_center_focus': '&#xea67;',
            'filter_drama': '&#xea68;',
            'filter_frames': '&#xea69;',
            'filter_hdr': '&#xea6a;',
            'filter_list': '&#xea6b;',
            'filter_none': '&#xea6c;',
            'filter_tilt_shift': '&#xea6d;',
            'filter_vintage': '&#xea6e;',
            'filter': '&#xea6f;',
            'find_in_page': '&#xea70;',
            'find_replace': '&#xea71;',
            'fingerprint': '&#xea72;',
            'flag': '&#xea73;',
            'flip_to_back': '&#xea76;',
            'flip_to_front': '&#xea77;',
            'folder_open': '&#xea78;',
            'folder_shared': '&#xea79;',
            'folder_special': '&#xea7a;',
            'folder': '&#xea7b;',
            'font_download': '&#xea7c;',
            'format_align_center': '&#xea7d;',
            'format_align_justify': '&#xea7e;',
            'format_align_left': '&#xea7f;',
            'format_align_right': '&#xea80;',
            'format_bold': '&#xea81;',
            'format_clear': '&#xea82;',
            'format_color_reset': '&#xea85;',
            'format_indent_decrease': '&#xea88;',
            'format_indent_increase': '&#xea89;',
            'format_italic': '&#xea8a;',
            'format_line_spacing': '&#xea8b;',
            'format_list_bulleted': '&#xea8c;',
            'format_list_numbered_rtl': '&#xea8d;',
            'format_list_numbered': '&#xea8e;',
            'format_paint': '&#xea8f;',
            'format_quote': '&#xea90;',
            'format_shapes': '&#xea91;',
            'format_size': '&#xea92;',
            'format_strikethrough': '&#xea93;',
            'format_textdirection_l_to_r': '&#xea94;',
            'format_textdirection_r_to_l': '&#xea95;',
            'format_underlined': '&#xea96;',
            'forum': '&#xea97;',
            'forward_5': '&#xea98;',
            'forward_10': '&#xea99;',
            'forward_30': '&#xea9a;',
            'forward': '&#xea9b;',
            'free_breakfast': '&#xea9c;',
            'fullscreen_exit': '&#xea9d;',
            'fullscreen': '&#xea9e;',
            'functions': '&#xea9f;',
            'g_translate': '&#xeaa0;',
            'gamepad': '&#xeaa1;',
            'games': '&#xeaa2;',
            'gavel': '&#xeaa3;',
            'gesture': '&#xeaa4;',
            'get_app': '&#xeaa5;',
            'gif': '&#xeaa6;',
            'golf_course': '&#xeaa7;',
            'gps_fixed': '&#xeaa8;',
            'gps_not_fixed': '&#xeaa9;',
            'gps_off': '&#xeaaa;',
            'grade': '&#xeaab;',
            'grain': '&#xeaac;',
            'graphic_eq': '&#xeaad;',
            'grid_off': '&#xeaae;',
            'grid_on': '&#xeaaf;',
            'group_add': '&#xeab0;',
            'group_work': '&#xeab1;',
            'group': '&#xeab2;',
            'hd': '&#xeab3;',
            'hdr_off': '&#xeab4;',
            'hdr_on': '&#xeab5;',
            'hdr_strong': '&#xeab6;',
            'hdr_weak': '&#xeab7;',
            'healing': '&#xeaba;',
            'hearing': '&#xeabb;',
            'help_24px': '&#xeabc;',
            'help': '&#xeabd;',
            'high_quality': '&#xeabe;',
            'highlight_off': '&#xeabf;',
            'highlight': '&#xeac0;',
            'history': '&#xeac1;',
            'home': '&#xeac2;',
            'horizontal_split': '&#xeac3;',
            'hotelhourglass_empty': '&#xeac6;',
            'hourglass_full': '&#xeac7;',
            'how_to_reg': '&#xeac8;',
            'how_to_vote': '&#xeac9;',
            'https': '&#xeacb;',
            'image_aspect_ratio': '&#xeacc;',
            'image_search': '&#xeacd;',
            'image': '&#xeace;',
            'import_contacts': '&#xeacf;',
            'import_export': '&#xead0;',
            'important_devices': '&#xead1;',
            'inbox': '&#xead2;',
            'indeterminate_check_box': '&#xead3;',
            'info': '&#xead4;',
            'input': '&#xead5;',
            'insert_chart_outlined': '&#xead6;',
            'insert_chart': '&#xead7;',
            'insert_comment': '&#xead8;',
            'insert_drive_file': '&#xead9;',
            'insert_emoticon': '&#xeada;',
            'insert_invitation': '&#xeadb;',
            'insert_link': '&#xeadc;',
            'insert_photo': '&#xeadd;',
            'invert_colors_off': '&#xeade;',
            'invert_colors': '&#xeadf;',
            'iso': '&#xeae0;',
            'keyboard_arrow_down': '&#xeae1;',
            'keyboard_arrow_left': '&#xeae2;',
            'keyboard_arrow_right': '&#xeae3;',
            'keyboard_arrow_up': '&#xeae4;',
            'keyboard_backspace': '&#xeae5;',
            'keyboard_capslock': '&#xeae6;',
            'keyboard_return': '&#xeae8;',
            'keyboard_tab': '&#xeae9;',
            'keyboard_voice': '&#xeaea;',
            'keyboard': '&#xeaeb;',
            'kitchen': '&#xeaec;',
            'label_important': '&#xeaed;',
            'label_off': '&#xeaee;',
            'label': '&#xeaef;',
            'landscape': '&#xeaf0;',
            'language': '&#xeaf1;',
            'last_page': '&#xeaf6;',
            'launch': '&#xeaf7;',
            'layers_clear': '&#xeaf8;',
            'layers': '&#xeaf9;',
            'leak_add': '&#xeafa;',
            'leak_remove': '&#xeafb;',
            'lens': '&#xeafc;',
            'library_add': '&#xeafd;',
            'library_books': '&#xeafe;',
            'library_music': '&#xeaff;',
            'line_style': '&#xeb00;',
            'line_weight': '&#xeb01;',
            'linear_scale': '&#xeb02;',
            'link_off': '&#xeb03;',
            'link': '&#xeb04;',
            'linked_camera': '&#xeb05;',
            'list_alt': '&#xeb06;',
            'list': '&#xeb07;',
            'live_help': '&#xeb08;',
            'live_tv': '&#xeb09;',
            'local_activity': '&#xeb0a;',
            'local_atm': '&#xeb0c;',
            'local_convenience_store': '&#xeb10;',
            'local_dining': '&#xeb11;',
            'local_hospital': '&#xeb16;',
            'local_library': '&#xeb19;',
            'local_mall': '&#xeb1a;',
            'local_movies': '&#xeb1b;',
            'local_offer': '&#xeb1c;',
            'local_parking': '&#xeb1d;',
            'local_pharmacy': '&#xeb1e;',
            'local_phone': '&#xeb1f;',
            'local_post_office': '&#xeb22;',
            'local_printshop': '&#xeb23;',
            'local_see': '&#xeb24;',
            'local_shipping': '&#xeb25;',
            'local_taxi': '&#xeb26;',
            'location_city': '&#xeb27;',
            'location_disabled': '&#xeb28;',
            'location_off': '&#xeb29;',
            'location_on': '&#xeb2a;',
            'location_searching': '&#xeb2b;',
            'lock_open': '&#xeb2c;',
            'lock': '&#xeb2d;',
            'looks_3': '&#xeb2e;',
            'looks_4': '&#xeb2f;',
            'looks_5': '&#xeb30;',
            'looks_6': '&#xeb31;',
            'looks_one': '&#xeb32;',
            'looks_two': '&#xeb33;',
            'looks': '&#xeb34;',
            'loop': '&#xeb35;',
            'loupe': '&#xeb36;',
            'low_priority': '&#xeb37;',
            'loyalty': '&#xeb38;',
            'mail_24px': '&#xeb39;',
            'mail': '&#xeb3a;',
            'map': '&#xeb3b;',
            'markunread_mailbox': '&#xeb3c;',
            'markunread': '&#xeb3d;',
            'maximize': '&#xeb3e;',
            'meeting_room': '&#xeb3f;',
            'memory': '&#xeb40;',
            'menu': '&#xeb41;',
            'mic_none': '&#xeb44;',
            'mic_off': '&#xeb45;',
            'mic': '&#xeb46;',
            'minimize': '&#xeb47;',
            'missed_video_call': '&#xeb48;',
            'mms': '&#xeb49;',
            'mobile_friendly': '&#xeb4a;',
            'mobile_off': '&#xeb4b;',
            'mobile_screen_share': '&#xeb4c;',
            'mode_comment': '&#xeb4d;',
            'monetization_on': '&#xeb4e;',
            'money_off': '&#xeb4f;',
            'money': '&#xeb50;',
            'monochrome_photos': '&#xeb51;',
            'mood_bad': '&#xeb52;',
            'mood': '&#xeb53;',
            'more_horiz': '&#xeb54;',
            'more_vert': '&#xeb55;',
            'more': '&#xeb56;',
            'motorcycle': '&#xeb57;',
            'mouse': '&#xeb58;',
            'move_to_inbox': '&#xeb59;',
            'movie_creation': '&#xeb5a;',
            'movie_filter': '&#xeb5b;',
            'movie': '&#xeb5c;',
            'multiline_chart': '&#xeb5d;',
            'music_note': '&#xeb5e;',
            'music_off': '&#xeb5f;',
            'music_video': '&#xeb60;',
            'my_location': '&#xeb61;',
            'nature_people': '&#xeb62;',
            'nature': '&#xeb63;',
            'navigate_before': '&#xeb64;',
            'navigate_next': '&#xeb65;',
            'navigation': '&#xeb66;',
            'near_me': '&#xeb67;',
            'network_checknew_releases': '&#xeb6e;',
            'next_week': '&#xeb6f;',
            'network_cnfcheck': '&#xeb70;',
            'no_encryption': '&#xeb71;',
            'no_simnot_interested': '&#xeb74;',
            'no_simnot_listed_location': '&#xeb75;',
            'note_add': '&#xeb76;',
            'note': '&#xeb77;',
            'notes': '&#xeb78;',
            'notifications_active': '&#xeb79;',
            'notifications_none': '&#xeb7a;',
            'notifications_off': '&#xeb7b;',
            'notifications_paused': '&#xeb7c;',
            'notifications': '&#xeb7d;',
            'offline_bolt': '&#xeb7e;',
            'offline_pin': '&#xeb7f;',
            'ondemand_video': '&#xeb80;',
            'opacity': '&#xeb81;',
            'open_in_browser': '&#xeb82;',
            'open_in_new': '&#xeb83;',
            'open_with': '&#xeb84;',
            'outlined_flag': '&#xeb85;',
            'pages': '&#xeb86;',
            'pageview': '&#xeb87;',
            'palette': '&#xeb88;',
            'pan_tool': '&#xeb89;',
            'panorama_fish_eye': '&#xeb8a;',
            'panorama_horizontal': '&#xeb8b;',
            'panorama_vertical': '&#xeb8c;',
            'panorama_wide_angle': '&#xeb8d;',
            'panorama': '&#xeb8e;',
            'party_mode': '&#xeb8f;',
            'pause_presentation': '&#xeb90;',
            'pause': '&#xeb91;',
            'payment': '&#xeb92;',
            'people_24px': '&#xeb93;',
            'people': '&#xeb94;',
            'perm_camera_mic': '&#xeb95;',
            'perm_contact_calendar': '&#xeb96;',
            'perm_device_information': '&#xeb98;',
            'perm_identity': '&#xeb99;',
            'perm_media': '&#xeb9a;',
            'perm_phone_msg': '&#xeb9b;',
            'perm_scan_wifi': '&#xeb9c;',
            'person_24px': '&#xeb9d;',
            'person_add_disabled': '&#xeb9e;',
            'person_add': '&#xeb9f;',
            'person_pin_circle': '&#xeba0;',
            'person_pin': '&#xeba1;',
            'person': '&#xeba2;',
            'personal_video': '&#xeba3;',
            'pets': '&#xeba4;',
            'phone_android': '&#xeba5;',
            'phone_bluetooth_speaker': '&#xeba6;',
            'phone_callback': '&#xeba7;',
            'phone_forwarded': '&#xeba8;',
            'phone_in_talk': '&#xeba9;',
            'phone_iphone': '&#xebaa;',
            'phone_locked': '&#xebab;',
            'phone_missed': '&#xebac;',
            'phone_paused': '&#xebad;',
            'phone': '&#xebae;',
            'phonelink_erase': '&#xebaf;',
            'phonelink_lock': '&#xebb0;',
            'phonelink_off': '&#xebb1;',
            'phonelink_ring': '&#xebb2;',
            'phonelink_setup': '&#xebb3;',
            'phonelink': '&#xebb4;',
            'photo_album': '&#xebb5;',
            'photo_camera': '&#xebb6;',
            'photo_filter': '&#xebb7;',
            'photo_library': '&#xebb8;',
            'photo_size_select_actual': '&#xebb9;',
            'photo_size_select_large': '&#xebba;',
            'photo_size_select_small': '&#xebbb;',
            'photo': '&#xebbc;',
            'picture_as_pdf': '&#xebbd;',
            'picture_in_picture_alt': '&#xebbe;',
            'picture_in_picture': '&#xebbf;',
            'pie_chart': '&#xebc0;',
            'pin_drop': '&#xebc1;',
            'place': '&#xebc2;',
            'play_arrow': '&#xebc3;',
            'play_circle_24px': '&#xebc4;',
            'play_circle_filled_white': '&#xebc5;',
            'play_circle_filled': '&#xebc6;',
            'play_for_work': '&#xebc7;',
            'playlist_add_check': '&#xebc8;',
            'playlist_add': '&#xebc9;',
            'playlist_play': '&#xebca;',
            'plus_one': '&#xebcb;',
            'poll': '&#xebcc;',
            'polymer': '&#xebcd;',
            'pool': '&#xebce;',
            'portable_wifi_off': '&#xebcf;',
            'portrait': '&#xebd0;',
            'power_input': '&#xebd1;',
            'power_off': '&#xebd2;',
            'power_settings_new': '&#xebd3;',
            'power': '&#xebd4;',
            'pregnant_woman': '&#xebd5;',
            'present_to_all': '&#xebd6;',
            'print_disabled': '&#xebd7;',
            'print': '&#xebd8;',
            'priority_high': '&#xebd9;',
            'public': '&#xebda;',
            'publish': '&#xebdb;',
            'query_builder': '&#xebdc;',
            'question_answer': '&#xebdd;',
            'queue_music': '&#xebde;',
            'queue_play_next': '&#xebdf;',
            'queue': '&#xebe0;',
            'radio_button_checked': '&#xebe1;',
            'radio_button_unchecked': '&#xebe2;',
            'radio': '&#xebe3;',
            'rate_review': '&#xebe4;',
            'receipt': '&#xebe5;',
            'recent_actors': '&#xebe6;',
            'record_voice_over': '&#xebe7;',
            'redeem': '&#xebe8;',
            'redo': '&#xebe9;',
            'refresh': '&#xebea;',
            'remove_circle_24px': '&#xebeb;',
            'remove_circle': '&#xebec;',
            'remove_from_queue': '&#xebed;',
            'remove_red_eye': '&#xebee;',
            'remove_shopping_cart': '&#xebef;',
            'remove': '&#xebf0;',
            'reorder': '&#xebf1;',
            'repeat_one': '&#xebf2;',
            'repeat': '&#xebf3;',
            'replay_5': '&#xebf4;',
            'replay_10': '&#xebf5;',
            'replay_30': '&#xebf6;',
            'replay': '&#xebf7;',
            'reply_all': '&#xebf8;',
            'reply': '&#xebf9;',
            'report_off': '&#xebfa;',
            'report_problem': '&#xebfb;',
            'report': '&#xebfc;',
            'restaurant_menu': '&#xebfd;',
            'restaurant': '&#xebfe;',
            'restore_from_trash': '&#xebff;',
            'restore_page': '&#xec00;',
            'restore': '&#xec01;',
            'ring_volume': '&#xec02;',
            'room': '&#xec03;',
            'rotate_90_degrees_ccw': '&#xec04;',
            'rotate_left': '&#xec05;',
            'rotate_right': '&#xec06;',
            'rounded_corner': '&#xec07;',
            'router': '&#xec08;',
            'rowing': '&#xec09;',
            'rss_feed': '&#xec0a;',
            'satellite': '&#xec0b;',
            'save_alt': '&#xec0c;',
            'save': '&#xec0d;',
            'scanner': '&#xec0e;',
            'scatter_plot': '&#xec0f;',
            'schedule': '&#xec10;',
            'school': '&#xec11;',
            'score': '&#xec12;',
            'screen_lock_landscape': '&#xec13;',
            'screen_lock_portrait': '&#xec14;',
            'screen_share': '&#xec17;',
            'search': '&#xec19;',
            'security': '&#xec1a;',
            'select_all': '&#xec1b;',
            'send': '&#xec1c;',
            'sentiment_dissatisfied': '&#xec1d;',
            'sentiment_satisfied_alt': '&#xec1e;',
            'sentiment_satisfied': '&#xec1f;',
            'sentiment_very_dissatisfied': '&#xec20;',
            'sentiment_very_satisfied': '&#xec21;',
            'settings_applications': '&#xec22;',
            'settings_backup_restore': '&#xec23;',
            'settings_bluetooth': '&#xec24;',
            'settings_brightness': '&#xec25;',
            'settings_cell': '&#xec26;',
            'settings_ethernet': '&#xec27;',
            'settings_input_antenna': '&#xec28;',
            'settings_input_component': '&#xec29;',
            'settings_input_composite': '&#xec2a;',
            'settings_input_hdmi': '&#xec2b;',
            'settings_input_svideo': '&#xec2c;',
            'settings_overscan': '&#xec2d;',
            'settings_phone': '&#xec2e;',
            'settings_power': '&#xec2f;',
            'settings_remote': '&#xec30;',
            'settings_system_daydream': '&#xec31;',
            'settings_voice': '&#xec32;',
            'settings': '&#xec33;',
            'share': '&#xec34;',
            'shop_two': '&#xec35;',
            'shop': '&#xec36;',
            'shopping_basket': '&#xec37;',
            'shopping_cart': '&#xec38;',
            'short_text': '&#xec39;',
            'show_chart': '&#xec3a;',
            'shuffle': '&#xec3b;',
            'shutter_speed': '&#xec3c;',
            'signal_cellular_alt': '&#xec45;',
            'skip_next': '&#xec66;',
            'skip_previous': '&#xec67;',
            'slideshow': '&#xec68;',
            'slow_motion_video': '&#xec69;',
            'smartphone': '&#xec6a;',
            'sms_failed': '&#xec6d;',
            'sms': '&#xec6e;',
            'snooze': '&#xec6f;',
            'sort_by_alpha': '&#xec70;',
            'sort': '&#xec71;',
            'spa': '&#xec72;',
            'space_bar': '&#xec73;',
            'speaker_group': '&#xec74;',
            'speaker_notes_off': '&#xec75;',
            'speaker_notes': '&#xec76;',
            'speaker_phone': '&#xec77;',
            'speaker': '&#xec78;',
            'spellcheck': '&#xec79;',
            'star_border': '&#xec7a;',
            'star_half': '&#xec7b;',
            'star_rate-18px': '&#xec7c;',
            'star': '&#xec7d;',
            'stars': '&#xec7e;',
            'stay_current_landscape': '&#xec7f;',
            'stay_current_portrait': '&#xec80;',
            'stay_primary_landscape': '&#xec81;',
            'stay_primary_portrait': '&#xec82;',
            'stop_screen_share': '&#xec83;',
            'stop': '&#xec84;',
            'storage': '&#xec85;',
            'store_mall_directory': '&#xec86;',
            'store': '&#xec87;',
            'straighten': '&#xec88;',
            'streetview': '&#xec89;',
            'strikethrough_s': '&#xec8a;',
            'style': '&#xec8b;',
            'subdirectory_arrow_left': '&#xec8c;',
            'subdirectory_arrow_right': '&#xec8d;',
            'subject': '&#xec8e;',
            'subtitles': '&#xec8f;',
            'subway': '&#xec90;',
            'supervised_user_circle': '&#xec91;',
            'supervisor_account': '&#xec92;',
            'surround_sound': '&#xec93;',
            'swap_calls': '&#xec94;',
            'swap_horiz': '&#xec95;',
            'swap_horizontal_circle': '&#xec96;',
            'swap_vert': '&#xec97;',
            'swap_vertical_circle': '&#xec98;',
            'switch_camera': '&#xec99;',
            'switch_video': '&#xec9a;',
            'sync_disabled': '&#xec9b;',
            'sync_problem': '&#xec9c;',
            'sync': '&#xec9d;',
            'system_update': '&#xec9e;',
            'tab_unselected': '&#xec9f;',
            'tab': '&#xeca0;',
            'table_chart': '&#xeca1;',
            'tablet_android': '&#xeca2;',
            'tablet_mac': '&#xeca3;',
            'tablet': '&#xeca4;',
            'tag_faces': '&#xeca5;',
            'tap_and_play': '&#xeca6;',
            'terrain': '&#xeca7;',
            'text_fields': '&#xeca8;',
            'text_format': '&#xeca9;',
            'text_rotate_up': '&#xecaa;',
            'text_rotate_vertical': '&#xecab;',
            'text_rotation_down': '&#xecac;',
            'text_rotation_none': '&#xecad;',
            'textsms': '&#xecae;',
            'texture': '&#xecaf;',
            'theaters': '&#xecb0;',
            'thumb_down_alt': '&#xecb1;',
            'thumb_down': '&#xecb2;',
            'thumb_up_alt': '&#xecb3;',
            'thumb_up': '&#xecb4;',
            'thumbs_up_down': '&#xecb5;',
            'time_to_leave': '&#xecb6;',
            'timelapse': '&#xecb7;',
            'timeline': '&#xecb8;',
            'timer_3': '&#xecb9;',
            'timer_10': '&#xecba;',
            'timer_off': '&#xecbb;',
            'timer': '&#xecbc;',
            'title': '&#xecbd;',
            'toc': '&#xecbe;',
            'today': '&#xecbf;',
            'toggle_off': '&#xecc0;',
            'toggle_on': '&#xecc1;',
            'toll': '&#xecc2;',
            'tonality': '&#xecc3;',
            'touch_app': '&#xecc4;',
            'toys': '&#xecc5;',
            'track_changes': '&#xecc6;',
            'traffic': '&#xecc7;',
            'train': '&#xecc8;',
            'tram': '&#xecc9;',
            'transfer_within_a_station': '&#xecca;',
            'transform': '&#xeccb;',
            'transit_enterexit': '&#xeccc;',
            'translate': '&#xeccd;',
            'trending_down': '&#xecce;',
            'trending_flat': '&#xeccf;',
            'trending_up': '&#xecd0;',
            'trip_origin': '&#xecd1;',
            'tune': '&#xecd2;',
            'turned_in_not': '&#xecd3;',
            'turned_in': '&#xecd4;',
            'tv_off': '&#xecd5;',
            'tv': '&#xecd6;',
            'unarchive': '&#xecd7;',
            'undo': '&#xecd8;',
            'unfold_less': '&#xecd9;',
            'unfold_more': '&#xecda;',
            'unsubscribe': '&#xecdb;',
            'update': '&#xecdc;',
            'usb': '&#xecdd;',
            'verified_user': '&#xecde;',
            'vertical_align_bottom': '&#xecdf;',
            'vertical_align_center': '&#xece0;',
            'vertical_align_top': '&#xece1;',
            'vertical_split': '&#xece2;',
            'vibration': '&#xece3;',
            'video_call': '&#xece4;',
            'video_label': '&#xece5;',
            'video_library': '&#xece6;',
            'videocam_off': '&#xece7;',
            'videocam': '&#xece8;',
            'videogame_asset': '&#xece9;',
            'view_agenda': '&#xecea;',
            'view_array': '&#xeceb;',
            'view_carousel': '&#xecec;',
            'view_column': '&#xeced;',
            'view_comfy': '&#xecee;',
            'view_compact': '&#xecef;',
            'view_day': '&#xecf0;',
            'view_headline': '&#xecf1;',
            'view_list': '&#xecf2;',
            'view_module': '&#xecf3;',
            'view_quilt': '&#xecf4;',
            'view_stream': '&#xecf5;',
            'view_week': '&#xecf6;',
            'vignette': '&#xecf7;',
            'visibility_off': '&#xecf8;',
            'visibility': '&#xecf9;',
            'voice_chat': '&#xecfa;',
            'voice_over_off': '&#xecfb;',
            'voicemail': '&#xecfc;',
            'volume_down': '&#xecfd;',
            'volume_mute': '&#xecfe;',
            'volume_off': '&#xecff;',
            'volume_up': '&#xed00;',
            'vpn_key': '&#xed01;',
            'vpn_lock': '&#xed02;',
            'wallpaper': '&#xed03;',
            'watch_later': '&#xed04;',
            'watch': '&#xed05;',
            'waves': '&#xed06;',
            'wb_auto': '&#xed07;',
            'wb_cloudy': '&#xed08;',
            'wb_incandescent': '&#xed09;',
            'wb_iridescent': '&#xed0a;',
            'wb_sunny': '&#xed0b;',
            'wc': '&#xed0c;',
            'web_asset': '&#xed0d;',
            'web': '&#xed0e;',
            'weekend': '&#xed0f;',
            'whatshot': '&#xed10;',
            'where_to_vote': '&#xed11;',
            'widgets': '&#xed12;',
            'wifi_lock': '&#xed13;',
            'wifi_tethering': '&#xed15;',
            'work_24px': '&#xed17;',
            'work_off': '&#xed18;',
            'work': '&#xed19;',
            'wrap_text': '&#xed1a;',
            'youtube_searched_for': '&#xed1b;',
            'zoom_in': '&#xed1c;',
            'zoom_out_map': '&#xed1d;',
            'zoom_out': '&#xed1e;',
          '0': 0
        };
        delete icons['0'];
        window.icomoonLiga = function (els) {
            var classes,
                el,
                i,
                innerHTML,
                key;
            els = els || document.getElementsByTagName('*');
            if (!els.length) {
                els = [els];
            }
            for (i = 0; ; i += 1) {
                el = els[i];
                if (!el) {
                    break;
                }
                classes = el.className;
                if (/htm-icon/.test(classes)) {
                    innerHTML = el.innerHTML;
                    if (innerHTML && innerHTML.length > 1) {
                        for (key in icons) {
                            if (icons.hasOwnProperty(key)) {
                                innerHTML = innerHTML.replace(new RegExp(key, 'g'), icons[key]);
                            }
                        }
                        el.innerHTML = innerHTML;
                    }
                }
            }
        };
        window.icomoonLiga();
    }
}());