
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data, error } = await supabase
    .from('event_info')
    .select('id, event_slug, groom_name, bride_name')
    .or('event_slug.is.null, event_slug.eq.""');

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  if (data.length === 0) {
    console.log('Semua data event memiliki slug yang valid.');
  } else {
    console.log(`Ditemukan ${data.length} event tanpa slug:`);
    data.forEach(item => {
      console.log(`- ID: ${item.id}, Groom: ${item.groom_name}, Bride: ${item.bride_name}, Slug: "${item.event_slug}"`);
    });
  }
}

checkData();
