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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { mockApi } from "@/services/mockApi";
import DashboardLayout from "@/components/DashboardLayout";

const formSchema = z.object({
  batch_id: z.string().min(1, "Batch ID is required").max(50, "Batch ID too long"),
  passed: z.coerce.number().int().min(0, "Must be 0 or greater"),
  failed: z.coerce.number().int().min(0, "Must be 0 or greater"),
  defect_type: z.string().min(1, "Defect type is required").max(100, "Defect type too long"),
});

const Testing = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batch_id: "",
      passed: 0,
      failed: 0,
      defect_type: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await mockApi.testing.create({
        batch_id: values.batch_id,
        passed: values.passed,
        failed: values.failed,
        defect_type: values.defect_type,
      });

      toast.success("Testing record submitted successfully!");
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
            <CardTitle>Quality Testing Data Entry</CardTitle>
            <CardDescription>
              Record test results and defect information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="batch_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., BATCH-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passed Count</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="failed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Failed Count</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defect_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Defect Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Surface scratch" {...field} />
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

export default Testing;
