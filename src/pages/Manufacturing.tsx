import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { mockApi } from "@/services/mockApi";
import DashboardLayout from "@/components/DashboardLayout";

const formSchema = z.object({
  production_count: z.coerce.number().int().min(0, "Must be 0 or greater"),
  scrap_count: z.coerce.number().int().min(0, "Must be 0 or greater"),
  shift: z.string().min(1, "Shift is required"),
  machine_id: z.string().min(1, "Machine ID is required").max(50, "Machine ID too long"),
});

const Manufacturing = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      production_count: 0,
      scrap_count: 0,
      shift: "",
      machine_id: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await mockApi.manufacturing.create({
        production_count: values.production_count,
        scrap_count: values.scrap_count,
        shift: values.shift,
        machine_id: values.machine_id,
      });

      toast.success("Manufacturing record submitted successfully!");
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit record. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Manufacturing Data Entry</CardTitle>
            <CardDescription>
              Record production and scrap counts for manufacturing operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="production_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Production Count</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scrap_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scrap Count</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="machine_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Machine ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., M-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Submit Record
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Manufacturing;
