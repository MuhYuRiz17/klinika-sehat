-- Allow new dokter to insert their own record during signup
CREATE POLICY "Dokter can insert own data" 
ON public.dokter 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow dokter to update their own data
CREATE POLICY "Dokter can update own data" 
ON public.dokter 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);