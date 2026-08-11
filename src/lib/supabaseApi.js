import { supabase } from './supabaseClient';

export const savePlanToSupabase = async (userId, title, markdown) => {
  const { data, error } = await supabase
    .from('plans')
    .insert([{ user_id: userId, title, markdown }])
    .select();
  if (error) throw error;
  return data[0];
};

export const fetchUserPlans = async (userId) => {
  const { data, error } = await supabase
    .from('plans')
    .select('id, title, created_at, markdown')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const fetchPlanChats = async (planId) => {
  const { data, error } = await supabase
    .from('chats')
    .select('role, content')
    .eq('plan_id', planId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const saveChatMessage = async (userId, planId, role, content) => {
  const { error } = await supabase
    .from('chats')
    .insert([{ plan_id: planId, user_id: userId, role, content }]);
  if (error) throw error;
};