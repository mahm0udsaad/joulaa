"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProduct } from "@/contexts/product-context";
import { useCategory } from "@/contexts/category-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Upload, Loader2, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/loading-spinner";
import Image from "next/image";

export default function ManageProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    products,
    getProductById,
    updateProduct,
    addProduct,
    uploadProductImage,
  } = useProduct();
  const { categories } = useCategory();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: 0,
    cost: 0,
    profitMargin: 0, // Changed back to profitMargin to match database schema
    discount: 0,
    category: "",
    stock_quantity: 0,
    image_urls: [""],
    colors: [] as { name: string; hex_value: string }[],
    shades: [] as { name: string; hex_value: string }[],
    variants: [] as { key: string; value: string }[], // Added variants for key-value pairs
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isDailyOffer: false,
    newArrivalHeroSection: false,
  });
  const [newColor, setNewColor] = useState({ name: "", hex_value: "" });
  const [newShade, setNewShade] = useState({ name: "", hex_value: "" });
  const [newVariant, setNewVariant] = useState({ key: "", value: "" }); // Added for variants
  const [activeTab, setActiveTab] = useState("basic");

  // Get the ID from either params (path parameter) or searchParams (query parameter)
  const idFromQuery = searchParams.get("id");
  const productIdStr = idFromQuery;
  const isEditMode = !!productIdStr;
  const productId = productIdStr ? Number.parseInt(productIdStr) : null;
  console.log(idFromQuery);

  useEffect(() => {
    if (isEditMode && productId) {
      const fetchProduct = async () => {
        const product = await getProductById(productId);
        if (product) {
          setFormData({
            name: product.name,
            brand: product.brand,
            description: product.description,
            price: product.price,
            cost: product.cost || 0,
            profitMargin: product.profitMargin || 0,
            discount: product.discount,
            category: product.category,
            stock_quantity: product.stock_quantity,
            image_urls: product.image_urls,
            colors: product.colors || [],
            shades: product.shades || [],
            variants: product.variants || [],
            isFeatured: product.isFeatured || false,
            isNewArrival: product.isNewArrival || false,
            isBestSeller: product.isBestSeller || false,
            isDailyOffer: product.isDailyOffer || false,
            newArrivalHeroSection: product.newArrivalHeroSection || false,
          });
        } else {
          toast({
            title: "Error",
            description: `Product with ID ${productId} not found`,
            variant: "destructive",
          });
          router.push("/admin/products");
        }
      };

      fetchProduct();
    }
    setIsLoading(false);
  }, [isEditMode, productId, getProductById, products, router]);

  // Calculate price based on cost and profitMargin
  useEffect(() => {
    if (formData.cost > 0 && formData.profitMargin >= 0) {
      const calculatedPrice = formData.cost + formData.profitMargin;
      setFormData((prev) => ({
        ...prev,
        price: Number.parseFloat(calculatedPrice.toFixed(2)),
      }));
    }
  }, [formData.cost, formData.profitMargin]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "cost" || name === "profitMargin") {
      setFormData({
        ...formData,
        [name]: Number.parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]:
          name === "price" || name === "discount" || name === "stock_quantity"
            ? Number.parseFloat(value) || 0
            : value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const updatedImages = [...formData.image_urls];
    updatedImages[index] = value;
    setFormData({
      ...formData,
      image_urls: updatedImages,
    });
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      image_urls: [...formData.image_urls, ""],
    });
  };

  const removeImageField = (index: number) => {
    const updatedImages = formData.image_urls.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      image_urls: updatedImages.length ? updatedImages : [""],
    });
  };

  const handleColorChange = (field: keyof typeof newColor, value: string) => {
    setNewColor({
      ...newColor,
      [field]: value,
    });
  };

  const handleShadeChange = (field: keyof typeof newShade, value: string) => {
    setNewShade({
      ...newShade,
      [field]: value,
    });
  };

  // Handle variant change
  const handleVariantChange = (
    field: keyof typeof newVariant,
    value: string,
  ) => {
    setNewVariant({
      ...newVariant,
      [field]: value,
    });
  };

  const addColor = () => {
    if (newColor.name && newColor.hex_value) {
      setFormData({
        ...formData,
        colors: [...formData.colors, { ...newColor }],
      });
      setNewColor({ name: "", hex_value: "" });
    }
  };

  const removeColor = (index: number) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  };

  const addShade = () => {
    if (newShade.name && newShade.hex_value) {
      setFormData({
        ...formData,
        shades: [...formData.shades, { ...newShade }],
      });
      setNewShade({ name: "", hex_value: "" });
    }
  };

  const removeShade = (index: number) => {
    setFormData({
      ...formData,
      shades: formData.shades.filter((_, i) => i !== index),
    });
  };

  // Add variant
  const addVariant = () => {
    if (newVariant.key && newVariant.value) {
      setFormData({
        ...formData,
        variants: [...formData.variants, { ...newVariant }],
      });
      setNewVariant({ key: "", value: "" });
    }
  };

  // Remove variant
  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  // Handle image upload button click
  const handleImageButtonClick = (index: number) => {
    fileInputRef.current?.click();
    // Store the current index to update the correct image URL
    fileInputRef.current?.setAttribute("data-index", index.toString());
  };

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Get the index from the data attribute
      const index = Number(
        fileInputRef.current?.getAttribute("data-index") || 0,
      );

      // Upload the image to Supabase Storage (using website bucket)
      const imageUrl = await uploadProductImage(file);

      // Update the image URL at the specified index
      const updatedImages = [...formData.image_urls];
      updatedImages[index] = imageUrl;

      setFormData({
        ...formData,
        image_urls: updatedImages,
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error uploading image:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (
        errorMessage.includes("bucket") &&
        errorMessage.includes("not found")
      ) {
        toast({
          title: "Storage Bucket Error",
          description:
            "The storage bucket does not exist. Please create it in the Supabase dashboard.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("row-level security")) {
        toast({
          title: "RLS Error",
          description:
            "Row Level Security is preventing access to the storage bucket. Please update RLS policies.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.brand ||
        !formData.category ||
        formData.image_urls[0] === ""
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Filter out empty image URLs
      const filteredImages = formData.image_urls.filter(
        (url) => url.trim() !== "",
      );

      if (filteredImages.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one image URL is required",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const productData = {
        ...formData,
        image_urls: filteredImages,
      };

      if (isEditMode && productId) {
        await updateProduct(productId, productData);
        toast({
          title: "Success",
          description: "Product updated successfully",
          variant: "success",
        });
      } else {
        await addProduct(productData);
        toast({
          title: "Success",
          description: "Product added successfully",
          variant: "success",
        });
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h1>
        {!isEditMode && (
          <Button
            onClick={() => router.push("/admin/products/add")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add New Product
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details of the product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>
                  Set pricing and inventory details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost ($) *</Label>
                    <Input
                      id="cost"
                      name="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profitMargin">Profit ($) *</Label>
                    <Input
                      id="profitMargin"
                      name="profitMargin"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.profitMargin}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      readOnly
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Automatically calculated from cost and profit
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (0-1)</Label>
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={formData.discount}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter as decimal (e.g., 0.1 for 10% off)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      name="stock_quantity"
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Add image URLs for the product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.image_urls.map((url, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row items-start gap-2"
                  >
                    <div className="flex-grow flex items-center gap-2 w-full">
                      <Input
                        value={url}
                        onChange={(e) =>
                          handleImageChange(index, e.target.value)
                        }
                        placeholder="Image URL"
                        required={index === 0}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleImageButtonClick(index)}
                        disabled={isUploading}
                        title="Upload image"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeImageField(index)}
                        disabled={
                          formData.image_urls.length === 1 && index === 0
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {url && (
                      <div className="mt-2 md:mt-0">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                          <Image
                            src={url || "/placeholder.svg"}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImageField}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants">
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>
                  Add color, shade, and feature variants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Colors Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Colors</h3>
                  <div className="space-y-4">
                    {formData.colors.map((color, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: color.hex_value }}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{color.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {color.hex_value}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeColor(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                      <div>
                        <Label htmlFor="colorName">Color Name</Label>
                        <Input
                          id="colorName"
                          value={newColor.name}
                          onChange={(e) =>
                            handleColorChange("name", e.target.value)
                          }
                          placeholder="Red"
                        />
                      </div>
                      <div>
                        <Label htmlFor="colorHex">Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="colorHex"
                            value={newColor.hex_value}
                            onChange={(e) =>
                              handleColorChange("hex_value", e.target.value)
                            }
                            placeholder="#FF0000"
                          />
                          <input
                            type="color"
                            value={newColor.hex_value}
                            onChange={(e) =>
                              handleColorChange("hex_value", e.target.value)
                            }
                            className="w-10 h-10 rounded-md border cursor-pointer"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={addColor}
                        disabled={!newColor.name || !newColor.hex_value}
                      >
                        Add Color
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Shades Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Shades</h3>
                  <div className="space-y-4">
                    {formData.shades.map((shade, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: shade.hex_value }}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{shade.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {shade.hex_value}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeShade(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                      <div>
                        <Label htmlFor="shadeName">Shade Name</Label>
                        <Input
                          id="shadeName"
                          value={newShade.name}
                          onChange={(e) =>
                            handleShadeChange("name", e.target.value)
                          }
                          placeholder="Light"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shadeHex">Shade</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="shadeHex"
                            value={newShade.hex_value}
                            onChange={(e) =>
                              handleShadeChange("hex_value", e.target.value)
                            }
                            placeholder="#FFF5E1"
                          />
                          <input
                            type="color"
                            value={newShade.hex_value}
                            onChange={(e) =>
                              handleShadeChange("hex_value", e.target.value)
                            }
                            className="w-10 h-10 rounded-md border cursor-pointer"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={addShade}
                        disabled={!newShade.name || !newShade.hex_value}
                      >
                        Add Shade
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Key-Value Variants Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Feature Variants</h3>
                  <div className="space-y-4">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{variant.key}</p>
                          <p className="text-sm text-muted-foreground">
                            {variant.value}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeVariant(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                      <div>
                        <Label htmlFor="variantKey">Feature Title</Label>
                        <Input
                          id="variantKey"
                          value={newVariant.key}
                          onChange={(e) =>
                            handleVariantChange("key", e.target.value)
                          }
                          placeholder="Free Shipping"
                        />
                      </div>
                      <div>
                        <Label htmlFor="variantValue">
                          Feature Description
                        </Label>
                        <Input
                          id="variantValue"
                          value={newVariant.value}
                          onChange={(e) =>
                            handleVariantChange("value", e.target.value)
                          }
                          placeholder="On orders over $50"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={addVariant}
                        disabled={!newVariant.key || !newVariant.value}
                      >
                        Add Feature
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visibility">
            <Card>
              <CardHeader>
                <CardTitle>Product Visibility</CardTitle>
                <CardDescription>
                  Control where this product appears on the site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="featured" className="text-base">
                      Featured Product
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show this product in the featured section
                    </p>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isFeatured", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newArrival" className="text-base">
                      New Arrival
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Mark this product as a new arrival
                    </p>
                  </div>
                  <Switch
                    id="newArrival"
                    checked={formData.isNewArrival}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isNewArrival", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bestSeller" className="text-base">
                      Best Seller
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Mark this product as a best seller
                    </p>
                  </div>
                  <Switch
                    id="bestSeller"
                    checked={formData.isBestSeller}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isBestSeller", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dailyOffer" className="text-base">
                      Daily Offer
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Include this product in daily offers
                    </p>
                  </div>
                  <Switch
                    id="dailyOffer"
                    checked={formData.isDailyOffer}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isDailyOffer", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="newArrivalHeroSection"
                      className="text-base"
                    >
                      New Arrival Hero Section
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show this product in the new arrival hero section
                    </p>
                  </div>
                  <Switch
                    id="newArrivalHeroSection"
                    checked={formData.newArrivalHeroSection}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("newArrivalHeroSection", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : isEditMode ? (
              "Update Product"
            ) : (
              "Add Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
