#include "pebble_os.h"
#include "pebble_app.h"
#include "pebble_fonts.h"
#include "num2words.h"
#include "ctype.h"

#define MY_UUID { 0xD4, 0xED, 0x05, 0xFF, 0x75, 0x8B, 0x46, 0x6F, 0x80, 0xBF, 0x55, 0xFA, 0xD9, 0xCB, 0xAA, 0x3C }
PBL_APP_INFO(MY_UUID,
             "jps Time",
             "jps IT ltd",
             1, 1, /* App version */
             DEFAULT_MENU_ICON,
             APP_INFO_WATCH_FACE);

#define BUFFER_SIZE 86



void line_layer_update_callback(Layer *me, GContext* ctx) {
    (void)me;
    
    graphics_context_set_stroke_color(ctx, GColorWhite);
    
    graphics_draw_line(ctx, GPoint(0, 33), GPoint(144, 33));
    graphics_draw_line(ctx, GPoint(0, 34), GPoint(144, 34));
    
}

static struct CommonWordsData {
  TextLayer label;
  Window window;
  char buffer[BUFFER_SIZE];
  Layer line_layer;
  TextLayer text_date_layer;

} s_data;

static void update_time(PblTm* t) {
  static char date_text[] = "Xxxxxxxxx 00";
  
  fuzzy_time_to_words(t->tm_hour, t->tm_min, s_data.buffer, BUFFER_SIZE);
  text_layer_set_text(&s_data.label, s_data.buffer);
  string_format_time(date_text, sizeof(date_text), "%a %e %b", t);
  
   /* for ( ; *date_text; ++date_text) *date_text = tolower(*date_text); */
  
  text_layer_set_text(&s_data.text_date_layer, date_text);
}

static void handle_minute_tick(AppContextRef app_ctx, PebbleTickEvent* e) {
  update_time(e->tick_time);
}

static void handle_init(AppContextRef ctx) {
  (void) ctx;

  window_init(&s_data.window, "jps Time");
  const bool animated = true;
  window_stack_push(&s_data.window, animated);

  window_set_background_color(&s_data.window, GColorBlack);
  GFont timefont = fonts_get_system_font(FONT_KEY_GOTHAM_30_BLACK);
  GFont datefont = fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD);

    
    text_layer_init(&s_data.text_date_layer, s_data.window.layer.frame);
    text_layer_set_text_color(&s_data.text_date_layer, GColorWhite);
    text_layer_set_background_color(&s_data.text_date_layer, GColorClear);
    layer_set_frame(&s_data.text_date_layer.layer, GRect(0, 0, 144, 32));
    text_layer_set_font(&s_data.text_date_layer, datefont);
    layer_add_child(&s_data.window.layer, &s_data.text_date_layer.layer);
    
  text_layer_init(&s_data.label, GRect(0, 35, s_data.window.layer.frame.size.w - 0, s_data.window.layer.frame.size.h - 35));
  text_layer_set_background_color(&s_data.label, GColorBlack);
  text_layer_set_text_color(&s_data.label, GColorWhite);
  text_layer_set_font(&s_data.label, timefont);
  layer_add_child(&s_data.window.layer, &s_data.label.layer);
    
    layer_init(&s_data.line_layer, s_data.window.layer.frame);
    s_data.line_layer.update_proc = &line_layer_update_callback;
    layer_add_child(&s_data.window.layer, &s_data.line_layer);
  

  PblTm t;
  get_time(&t);
  update_time(&t);
}



void pbl_main(void *params) {
  PebbleAppHandlers handlers = {
    .init_handler = &handle_init,

    .tick_info = {
      .tick_handler = &handle_minute_tick,
      .tick_units = MINUTE_UNIT
    }

  };
  app_event_loop(params, &handlers);
}
